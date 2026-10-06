import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { normalizeChannelHandle } from "@/lib/video/channel-handle";
import { existingVideoIds } from "@/lib/video/ingest-video";
import { fetchVideosMeta, listUploadVideoIds, resolveChannelByHandle } from "@/lib/video/youtube-data-api";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

const MAX_VIDEOS = 100;

/**
 * POST {handle} → các video gần đây của kênh để nạp: {channel, videos: [{videoId, title, durationSec, embeddable, exists}]}.
 * Chỉ quản trị viên. Chưa kiểm tra phụ đề (việc đó làm lúc nạp từng video), nên "cần nạp" gồm cả video sẽ bị bỏ qua vì không có phụ đề.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { handle?: unknown } | null;
  const handle = typeof body?.handle === "string" ? normalizeChannelHandle(body.handle) : null;
  if (!handle) return Response.json({ error: "invalid_handle" }, { status: 400 });

  try {
    const key = getServerEnv().YOUTUBE_DATA_API_KEY;
    const channel = await resolveChannelByHandle(handle, key);
    if (!channel) return Response.json({ error: "channel_not_found" }, { status: 404 });
    const ids = await listUploadVideoIds(channel.uploadsPlaylistId, key, MAX_VIDEOS);
    const [meta, have] = await Promise.all([fetchVideosMeta(ids, key), existingVideoIds(createSupabaseServiceClient(), ids)]);
    const videos = ids.flatMap((id) => {
      const m = meta.get(id);
      return m ? [{ videoId: id, title: m.title, durationSec: m.durationSec, embeddable: m.embeddable, exists: have.has(id) }] : [];
    });
    return Response.json({ channel: { id: channel.id, title: channel.title }, videos }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_ingest_plan_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
