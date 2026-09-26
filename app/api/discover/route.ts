import { DISCOVER_PAGE_SIZE, parseDiscoverParams, type DiscoverSong } from "@/lib/discover/discover-query";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * GET /api/discover?sort=new|popular&band=1-2|3-4|5-6|7&q=…&offset=… → bài đã được phân tích để người dùng chọn học.
 * Chỉ trả tên bài, kênh, cấp trung bình và số người đã nghe (không lời, không danh tính). Dữ liệu chung nên cache ở edge vài phút.
 */
export async function GET(req: Request) {
  const params = parseDiscoverParams(new URL(req.url).searchParams);
  let query = createSupabaseServiceClient()
    .from("discover_songs")
    .select("video_id,title,channel_title,level_avg,listeners", { count: "exact" });
  if (params.band) query = query.gte("level_avg", params.band[0]).lt("level_avg", params.band[1]);
  if (params.query) query = query.ilike("title", `%${params.query}%`);
  query = params.sort === "popular"
    ? query.order("listeners", { ascending: false }).order("created_at", { ascending: false })
    : query.order("created_at", { ascending: false });

  const { data, error, count } = await query.range(params.offset, params.offset + DISCOVER_PAGE_SIZE - 1);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  const songs: DiscoverSong[] = (data ?? []).map((r) => ({
    videoId: r.video_id, title: r.title, channelTitle: r.channel_title, levelAvg: r.level_avg, listeners: Number(r.listeners),
  }));
  return Response.json(
    { songs, hasMore: params.offset + songs.length < (count ?? 0) },
    { headers: { "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600" } },
  );
}
