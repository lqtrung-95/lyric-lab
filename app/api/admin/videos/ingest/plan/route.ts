import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { normalizeChannelHandle } from "@/lib/video/channel-handle";
import { buildPlanVideos } from "@/lib/video/plan-videos";
import { listUploadVideoIds, resolveChannelByHandle, resolveChannelById } from "@/lib/video/youtube-data-api";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const MAX_VIDEOS = 100;

/**
 * POST {handle} hoặc {channelId, limit?} → các video gần đây của kênh để nạp: {channel, videos: [{videoId, title, channelTitle, durationSec, embeddable, exists}]}.
 * `channelId` (mã UC…) dùng cho kênh đã lưu ở danh sách theo dõi. Chỉ quản trị viên. Chưa kiểm tra phụ đề (việc đó làm lúc nạp từng video), nên "cần nạp" gồm cả video sẽ bị bỏ qua vì không có phụ đề.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { handle?: unknown; channelId?: unknown; limit?: unknown } | null;
  const handle = typeof body?.handle === "string" ? normalizeChannelHandle(body.handle) : null;
  const channelId = typeof body?.channelId === "string" && /^UC[\w-]{22}$/.test(body.channelId) ? body.channelId : null;
  if (!handle && !channelId) return Response.json({ error: "invalid_handle" }, { status: 400 });
  const limit = typeof body?.limit === "number" && body.limit >= 1 ? Math.min(Math.floor(body.limit), MAX_VIDEOS) : MAX_VIDEOS;

  try {
    const key = getServerEnv().YOUTUBE_DATA_API_KEY;
    const channel = handle ? await resolveChannelByHandle(handle, key) : await resolveChannelById(channelId!, key);
    if (!channel) return Response.json({ error: "channel_not_found" }, { status: 404 });
    const ids = await listUploadVideoIds(channel.uploadsPlaylistId, key, limit);
    const videos = await buildPlanVideos(createSupabaseServiceClient(), ids, key);
    return Response.json({ channel: { id: channel.id, title: channel.title }, videos }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_ingest_plan_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
