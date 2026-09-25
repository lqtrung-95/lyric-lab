import { toAnalysisErrorCode, type AnalysisErrorCode } from "@/lib/analysis/analysis-error-codes";
import { analyzeVideo } from "@/lib/analysis/analyze-video";
import { createAnalyzeDeps, readCachedAnalysis } from "@/lib/analysis/server-deps";
import { encodeSseEvent } from "@/lib/http/sse";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { fetchVideoMeta } from "@/lib/youtube/fetch-video-meta";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

// 10 bài mới/ngày cho mỗi IP (PRD §7). Bài đã cache không tính. Đây là lớp chặn thô; xem ghi chú trong lớp.
const limiter = new InMemoryRateLimiter(10, 24 * 60 * 60 * 1000);
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
        if (!running && !limiter.tryConsume(ip)) return fail("rate_limited");

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
