import { after } from "next/server";
import { getCurrentUser } from "@/lib/auth/current-user";
import { toAnalysisErrorCode, type AnalysisErrorCode } from "@/lib/analysis/analysis-error-codes";
import { analyzeVideo } from "@/lib/analysis/analyze-video";
import { createAnalyzeDeps, readCachedAnalysis } from "@/lib/analysis/server-deps";
import { encodeSseEvent } from "@/lib/http/sse";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { prewarmTts } from "@/lib/tts/prewarm-tts";
import { fetchVideoMeta } from "@/lib/youtube/fetch-video-meta";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Hạn mức chính theo tài khoản (10 ẩn danh / 30 đã đăng nhập mỗi 24 giờ, PRD §7) nằm trong DB. Bài đã cache không tính.
// Lớp phụ theo IP chặn thô việc tạo hàng loạt tài khoản ẩn danh từ một nơi (rộng hơn vì nhiều người có thể chung IP).
const ipLimiter = new InMemoryRateLimiter(30, 24 * 60 * 60 * 1000);
// Nhiều yêu cầu cùng một video cùng lúc chỉ chạy pipeline một lần (tránh tốn token LLM lặp).
const inFlight = new Map<string, Promise<unknown>>();

const clientIp = (req: Request) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

/** Luồng SSE: `meta` (tiêu đề, kênh) → `step` (lyrics | analysis) → `done` hoặc `error`. */
export async function GET(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ code: "invalid_video" satisfies AnalysisErrorCode }, { status: 400 });

  const encoder = new TextEncoder();
  const ip = clientIp(req);

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        try {
          controller.enqueue(encoder.encode(encodeSseEvent(event, data)));
        } catch {
          // Client đã ngắt kết nối (bấm Hủy): bỏ qua.
        }
      };
      const fail = (code: AnalysisErrorCode) => send("error", { code });

      try {
        const video = await fetchVideoMeta(videoId);
        if (!video) return fail("video_not_found");
        send("meta", { title: video.title, channelTitle: video.channelTitle, durationSec: video.durationSec });

        if (await readCachedAnalysis(videoId)) return send("done", { fromCache: true });

        const running = inFlight.get(videoId);
        if (!running) {
          const user = await getCurrentUser();
          if (!user) return fail("auth_required");
          if (!ipLimiter.tryConsume(ip) || !(await consumeUsage(user, "analyze"))) return fail("rate_limited");
        }

        const job = running ?? analyzeVideo(video, createAnalyzeDeps((step) => send("step", { step })));
        if (!running) {
          inFlight.set(videoId, job);
          job.finally(() => inFlight.delete(videoId)).catch(() => {});
        } else {
          send("step", { step: "analysis" });
        }

        const result = (await job) as Awaited<ReturnType<typeof analyzeVideo>>;
        console.info(JSON.stringify({
          event: "analysis", videoId, source: result.analysis.lyricsSource, model: result.analysis.model,
          items: result.analysis.items.length,
          attempts: result.attempts.map((a) => ({ model: a.model, ok: a.ok, ms: a.latencyMs, dropped: a.dropped?.length ?? 0 })),
        }));
        send("done", { fromCache: false });
        // Sau khi đã trả kết quả cho người dùng: tổng hợp sẵn giọng đọc cho các từ vựng của bài để bấm loa là nghe ngay.
        const vocabTerms = result.analysis.items.filter((i) => i.type === "vocab").map((i) => i.term);
        after(async () => {
          const created = await prewarmTts(createSupabaseServiceClient(), vocabTerms).catch(() => 0);
          console.info(JSON.stringify({ event: "tts_prewarm", videoId, created }));
        });
      } catch (error) {
        console.error(JSON.stringify({ event: "analysis_error", videoId, name: (error as Error)?.name, message: (error as Error)?.message }));
        fail(toAnalysisErrorCode(error));
      } finally {
        try {
          controller.close();
        } catch {
          // Đã đóng.
        }
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "no-cache, no-transform", Connection: "keep-alive" },
  });
}
