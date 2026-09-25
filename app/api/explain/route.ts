import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { ExplainError, explainTerm } from "@/lib/lookup/explain-term";
import { explainRequestSchema } from "@/lib/lookup/explain-schema";
import { createExplainDeps } from "@/lib/lookup/server-lookup";
import { readCachedAnalysis } from "@/lib/analysis/server-deps";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";
export const maxDuration = 30;

// Mỗi lần gọi LLM tốn token: hạn mức chính theo tài khoản (DB); 300 lần/ngày/IP là lớp chặn thô phụ. Kết quả đã cache không tính.
const ipLimiter = new InMemoryRateLimiter(300, 24 * 60 * 60 * 1000);

/** POST /api/explain {videoId, lineIndex, term} → nghĩa của từ trong đúng câu hát, tiếng Việt (LS-06). */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = explainRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const analysis = await readCachedAnalysis(parsed.data.videoId);
    if (!analysis) return Response.json({ error: "analysis_not_found" }, { status: 404 });

    const started = Date.now();
    const result = await explainTerm(analysis.lines, parsed.data, createExplainDeps(async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "explain"))));
    console.info(JSON.stringify({ event: "explain", videoId: parsed.data.videoId, fromCache: result.fromCache, model: result.model, ms: Date.now() - started }));
    return Response.json(result);
  } catch (error) {
    if (error instanceof ExplainError || (error as Error)?.name === "ExplainError") {
      const code = (error as ExplainError).code;
      const status = code === "term_not_in_line" ? 400 : code === "rate_limited" ? 429 : 502;
      return Response.json({ error: code }, { status });
    }
    console.error(JSON.stringify({ event: "explain_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
