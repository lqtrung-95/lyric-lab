import { getListedLesson } from "@/lib/video/video-repo";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/** GET /api/videos/[videoId] → video đã duyệt kèm toàn bộ dòng (chữ, pinyin, bản dịch, token). 404 nếu chưa duyệt, đã ẩn hoặc không có. */
export async function GET(_req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ error: "not_found" }, { status: 404 });
  try {
    const lesson = await getListedLesson(videoId);
    if (!lesson) return Response.json({ error: "not_found" }, { status: 404 });
    return Response.json(lesson, { headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_detail_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
