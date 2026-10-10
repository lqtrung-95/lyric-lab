import { getCurrentUser } from "@/lib/auth/current-user";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createChat } from "@/lib/analysis/server-deps";
import { GEMINI_MODELS } from "@/lib/analysis/gemini-models";
import { getServerEnv } from "@/lib/env/server-env";
import { loadLinesForVideo } from "@/lib/lookup/load-video-lines";
import { feedbackRequestSchema } from "@/lib/pronunciation/feedback-schema";
import { FeedbackError, giveFeedback } from "@/lib/pronunciation/give-feedback";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(150, 24 * 60 * 60 * 1000);

/**
 * POST /api/pronunciation-feedback {videoId, lineIndex, mimeType, audio(base64)} → nhận xét phát âm bằng tiếng Việt.
 * Âm thanh chỉ chuyển tiếp sang Gemini để nghe, không lưu ở server của ta. Chỉ chạy khi người học bấm nút (không tự động).
 */
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
  const parsed = feedbackRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const env = getServerEnv();
  if (!env.GEMINI_API_KEYS) return Response.json({ error: "feedback_unavailable" }, { status: 503 });

  try {
    const lines = await loadLinesForVideo(parsed.data.videoId);
    if (!lines) return Response.json({ error: "analysis_not_found" }, { status: 404 });
    const started = Date.now();
    const result = await giveFeedback(lines, parsed.data, {
      chat: createChat(env), models: GEMINI_MODELS,
      allowLlmCall: async () => ipLimiter.tryConsume(ip) && (await consumeUsage(user, "voice")),
    });
    console.info(JSON.stringify({ event: "pronunciation_feedback", videoId: parsed.data.videoId, model: result.model, score: result.score, ms: Date.now() - started }));
    return Response.json(result);
  } catch (error) {
    if (error instanceof FeedbackError || (error as Error)?.name === "FeedbackError") {
      const code = (error as FeedbackError).code;
      return Response.json({ error: code }, { status: code === "line_not_found" ? 400 : code === "rate_limited" ? 429 : 502 });
    }
    console.error(JSON.stringify({ event: "pronunciation_feedback_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
