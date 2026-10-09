import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * GET /api/videos/lessons-among?ids=a,b,c → { videoIds: [...] }: những id (tối đa 200) có bài học video chưa bị ẩn, để từ đã lưu dẫn thẳng tới /video/<id>
 * thay vì /learn/<id>. Chỉ trả lại id đã gửi, không có tên hay phụ đề. Lỗi thì trả rỗng (link rơi về /learn, trang đó tự chuyển sang video).
 */
export async function GET(req: Request) {
  const ids = [...new Set((new URL(req.url).searchParams.get("ids") ?? "").split(",").filter(isValidVideoId))].slice(0, 200);
  if (ids.length === 0) return Response.json({ videoIds: [] });
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("video_id").in("video_id", ids).neq("status", "hidden");
  const videoIds = error ? [] : (data ?? []).map((r) => r.video_id as string);
  return Response.json({ videoIds }, { headers: { "Cache-Control": "private, max-age=300" } });
}
