import { listListedLessons } from "@/lib/video/video-repo";

export const runtime = "nodejs";

/**
 * GET /api/videos → danh sách video luyện nghe đã duyệt (tên, kênh, thời lượng, cấp HSK trung bình, số dòng; không có lời).
 * Dữ liệu chung nên cache ở edge vài chục giây.
 */
export async function GET() {
  try {
    const videos = await listListedLessons();
    return Response.json({ videos }, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "videos_list_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
