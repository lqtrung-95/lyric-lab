import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { buildPlanVideos } from "@/lib/video/plan-videos";
import { buildCcSearchParams, isQuotaError, normalizeSearchQuery, SEARCH_DURATIONS, type SearchDuration } from "@/lib/video/video-discovery";
import { searchVideoIds } from "@/lib/video/youtube-data-api";

export const runtime = "nodejs";
export const maxDuration = 30;
export const dynamic = "force-dynamic";

/**
 * POST {query, duration?, pageToken?} → video giấy phép Creative Commons có phụ đề khớp từ khóa:
 * {videos: [{videoId, title, channelTitle, durationSec, embeddable, exists}], nextPageToken}. Chưa kiểm phụ đề tiếng Trung do người làm
 * (việc đó làm lúc nạp từng video). Mỗi lần tìm tốn 100 đơn vị hạn mức YouTube. 429 {error: "quota"} khi hết hạn mức. Chỉ quản trị viên.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { query?: unknown; duration?: unknown; pageToken?: unknown } | null;
  const query = normalizeSearchQuery(body?.query);
  if (!query) return Response.json({ error: "invalid_query" }, { status: 400 });
  const duration = SEARCH_DURATIONS.find((d) => d === body?.duration) as SearchDuration | undefined;
  const pageToken = typeof body?.pageToken === "string" && /^[\w-]{1,100}$/.test(body.pageToken) ? body.pageToken : undefined;

  try {
    const key = getServerEnv().YOUTUBE_DATA_API_KEY;
    const { ids, nextPageToken } = await searchVideoIds(buildCcSearchParams(query, { duration, pageToken }), key);
    const videos = await buildPlanVideos(createSupabaseServiceClient(), ids, key);
    return Response.json({ videos, nextPageToken }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_search_error", message: (error as Error)?.message }));
    return isQuotaError(error) ? Response.json({ error: "quota" }, { status: 429 }) : Response.json({ error: "server_error" }, { status: 500 });
  }
}
