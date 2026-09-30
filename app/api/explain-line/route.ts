import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { ExplainLineError, explainLine } from "@/lib/lookup/explain-line";
import { explainLineRequestSchema } from "@/lib/lookup/explain-line-schema";
import { createExplainLineDeps } from "@/lib/lookup/server-lookup";
import { readCachedAnalysis } from "@/lib/analysis/server-deps";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";

export const runtime = "nodejs";
export const maxDuration = 30;

// Cùng lớp chặn thô với /api/explain (dùng chung hạn mức "explain" theo tài khoản). Kết quả đã cache không tính.
const ipLimiter = new InMemoryRateLimiter(300, 24 * 60 * 60 * 1000);

/** POST /api/explain-line {videoId, lineIndex} → giải nghĩa cả câu hát (tự nhiên hơn bản dịch máy), tiếng Việt. */
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
  const parsed = explainLineRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  try {
    const analysis = await readCachedAnalysis(parsed.data.videoId);
    if (!analysis) return Response.json({ error: "analysis_not_found" }, { status: 404 });

    const started = Date.now();
    const result = await explainLine(analysis.lines, parsed.data, createExplainLineDeps(async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "explain"))));
    console.info(JSON.stringify({ event: "explain_line", videoId: parsed.data.videoId, fromCache: result.fromCache, model: result.model, ms: Date.now() - started }));
    return Response.json(result);
  } catch (error) {
    if (error instanceof ExplainLineError || (error as Error)?.name === "ExplainLineError") {
      const code = (error as ExplainLineError).code;
      const status = code === "line_not_found" ? 400 : code === "rate_limited" ? 429 : 502;
      return Response.json({ error: code }, { status });
    }
    console.error(JSON.stringify({ event: "explain_line_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
