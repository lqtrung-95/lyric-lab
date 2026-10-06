import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isTransientCaptionError } from "@/lib/video/channel-handle";
import { ensureSource, ingestVideo } from "@/lib/video/ingest-video";
import { fetchVideosMeta } from "@/lib/video/youtube-data-api";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
// Một video mỗi lần gọi (tải hai bản phụ đề, chia từ, tra từ điển): đủ trong 60 giây của gói Hobby. Nơi gọi nạp nối tiếp từng video.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

/**
 * POST {videoId, owned?} → nạp một video vào kho (trạng thái nháp). Trả {kind: "ingested", lineCount, translatedLineCount, levelAvg} hoặc
 * {kind: "skipped", reason}. 503 {error: "blocked"} khi YouTube đang chặn tạm việc tải phụ đề (nơi gọi nghỉ rồi thử lại). Chỉ quản trị viên.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { videoId?: unknown; owned?: unknown } | null;
  if (typeof body?.videoId !== "string" || !isValidVideoId(body.videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });

  try {
    const meta = (await fetchVideosMeta([body.videoId], getServerEnv().YOUTUBE_DATA_API_KEY)).get(body.videoId);
    if (!meta) return Response.json({ error: "video_not_found" }, { status: 404 });
    const sb = createSupabaseServiceClient();
    const sourceId = await ensureSource(sb, { id: meta.channelId, title: meta.channelTitle }, body.owned === true);
    const outcome = await ingestVideo(
      { sb, provider: new YoutubeInnertubeCaptionProvider(), lookup: (terms) => lookupWords(sb as never, terms) },
      { meta, sourceId },
    );
    return Response.json(outcome, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_ingest_error", videoId: body.videoId, message: (error as Error)?.message }));
    return isTransientCaptionError(error) ? Response.json({ error: "blocked" }, { status: 503 }) : Response.json({ error: "server_error" }, { status: 500 });
  }
}
