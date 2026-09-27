import { unstable_cache } from "next/cache";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { normalizeSearchQuery, type SearchResponse, type SearchSong } from "@/lib/search/search-types";
import { SearchUnavailableError, searchYoutubeSongs } from "@/lib/search/youtube-search";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

// 60 lượt tìm/giờ/IP (lớp chặn thô). Kết quả YouTube được lưu 10 phút theo từ khóa để nhiều người cùng tìm không tốn thêm hạn mức.
const limiter = new InMemoryRateLimiter(60, 60 * 60 * 1000);
const cachedYoutube = unstable_cache(async (q: string) => searchYoutubeSongs(q), ["youtube-song-search"], { revalidate: 600 });

async function searchLibrary(q: string): Promise<SearchSong[]> {
  const { data } = await createSupabaseServiceClient().from("discover_songs").select("video_id,title,channel_title,duration_sec")
    .or(`title.ilike.%${q}%,channel_title.ilike.%${q}%`).order("listeners", { ascending: false }).limit(5);
  return (data ?? []).map((r) => ({ videoId: r.video_id, title: r.title, channelTitle: r.channel_title, durationSec: r.duration_sec ?? undefined }));
}

/**
 * GET /api/search?q=… → { library, youtube }. `library` là bài đã phân tích (mở học ngay), `youtube` là kết quả tìm trên YouTube.
 * YouTube không tìm được (cả hai nguồn lỗi hoặc hết hạn mức) thì 503 `search_unavailable` kèm phần `library` nếu có.
 */
export async function GET(req: Request) {
  const q = normalizeSearchQuery(new URL(req.url).searchParams.get("q") ?? "");
  if (!q) return Response.json({ error: "invalid_query" }, { status: 400 });
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const [library, youtube] = await Promise.allSettled([searchLibrary(q), cachedYoutube(q)]);
  const lib = library.status === "fulfilled" ? library.value : [];
  if (youtube.status === "rejected") {
    if (!(youtube.reason instanceof SearchUnavailableError)) console.error(JSON.stringify({ event: "search_error", message: String(youtube.reason) }));
    return Response.json({ error: "search_unavailable", library: lib, youtube: [] }, { status: 503 });
  }
  const libIds = new Set(lib.map((s) => s.videoId));
  const body: SearchResponse = { library: lib, youtube: youtube.value.filter((s) => !libIds.has(s.videoId)) };
  return Response.json(body, { headers: { "Cache-Control": "private, max-age=60" } });
}
