import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { AskLineError, askLine } from "@/lib/lookup/ask-line";
import { askLineRequestSchema } from "@/lib/lookup/ask-line-schema";
import { loadLinesForVideo } from "@/lib/lookup/load-video-lines";

export const runtime = "nodejs";
export const maxDuration = 30;

// Hạn mức chính theo tài khoản (loại "ask", trong DB); 300 lần/ngày/IP là lớp chặn thô phụ.
const ipLimiter = new InMemoryRateLimiter(300, 24 * 60 * 60 * 1000);

/** POST /api/ask-line {videoId, lineIndex, question, history?} → câu trả lời tiếng Việt cho câu hỏi tự do về một câu của bài hát/video. */
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
  const parsed = askLineRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  let consumed = false; // đã trừ lượt cho yêu cầu này: lỗi phía hệ thống thì hoàn lại
  try {
    const lines = await loadLinesForVideo(parsed.data.videoId);
    if (!lines) return Response.json({ error: "analysis_not_found" }, { status: 404 });
    const started = Date.now();
    const result = await askLine(lines, parsed.data, {
      chat: createChat(getServerEnv()),
      allowLlmCall: async () => (consumed = ipLimiter.tryConsume(ip) && (await consumeUsage(user, "ask"))),
    });
    console.info(JSON.stringify({ event: "ask_line", videoId: parsed.data.videoId, model: result.model, ms: Date.now() - started }));
    return Response.json(result);
  } catch (error) {
    if (consumed && (error as { code?: string })?.code !== "rate_limited") await refundUsage(user, "ask");
    if (error instanceof AskLineError || (error as Error)?.name === "AskLineError") {
      const code = (error as AskLineError).code;
      return Response.json({ error: code }, { status: code === "line_not_found" ? 400 : code === "rate_limited" ? 429 : 502 });
    }
    console.error(JSON.stringify({ event: "ask_line_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
