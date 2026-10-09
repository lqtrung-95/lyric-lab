import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * GET /api/songs/moods?ids=a,b,c → { moods: { <videoId>: [nhóm cảm xúc] } } cho tối đa 200 bài, dùng để lọc "Bài hát của tôi" theo cảm xúc
 * (bài của người dùng có thể chỉ lưu ở trình duyệt nên server không biết danh sách). Chỉ trả nhóm cảm xúc, không có tên bài hay lời. Lỗi thì trả rỗng.
 */
export async function GET(req: Request) {
  const ids = [...new Set((new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(isValidVideoId))].slice(0, 200);
  if (ids.length === 0) return Response.json({ moods: {} });
  const { data, error } = await createSupabaseServiceClient().from("songs").select("video_id,mood_groups").in("video_id", ids);
  const moods: Record<string, string[]> = {};
  if (!error) for (const row of data ?? []) moods[row.video_id] = (row.mood_groups as string[] | null) ?? [];
  return Response.json({ moods }, { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } });
}
