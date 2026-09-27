import { getCurrentUser } from "@/lib/auth/current-user";
import { SONG_REPORT_HIDE_THRESHOLD } from "@/lib/analysis/song-report-reasons";
import { songReportRequestSchema } from "@/lib/analysis/song-report-schema";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/**
 * POST {videoId, reason} → báo cả bài phân tích sai. Mỗi người một lần cho mỗi bài (báo lại thì cập nhật lý do).
 * Đủ SONG_REPORT_HIDE_THRESHOLD người khác nhau thì bài bị ẩn khỏi Khám phá (giữ nguyên bản phân tích).
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = songReportRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const { videoId, reason } = parsed.data;
  const sb = createSupabaseServiceClient();
  const saved = await sb.from("song_reports").upsert({ video_id: videoId, user_id: user.id, reason }, { onConflict: "video_id,user_id" });
  if (saved.error) {
    // 23503: bài chưa có trong kho (không thể báo bài chưa từng phân tích).
    const notFound = saved.error.code === "23503";
    return Response.json({ error: notFound ? "not_found" : "server_error" }, { status: notFound ? 404 : 500 });
  }
  const { count } = await sb.from("song_reports").select("id", { count: "exact", head: true }).eq("video_id", videoId);
  if ((count ?? 0) >= SONG_REPORT_HIDE_THRESHOLD) await sb.from("songs").update({ listed: false }).eq("video_id", videoId);
  return Response.json({ ok: true }, { status: 201 });
}
