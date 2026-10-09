import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { shouldAutoHide } from "@/lib/video/video-report-policy";
import { listOpenReports } from "@/lib/video/video-report-repo";
import { MAX_VIDEO_REPORTS_PER_USER_PER_DAY, VIDEO_REPORT_REASONS } from "@/lib/video/video-report-reasons";
import type { LessonStatus } from "@/lib/video/video-lesson-types";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const bodySchema = z.object({ reason: z.enum(VIDEO_REPORT_REASONS) });
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });

/**
 * POST {reason} → báo cả video có vấn đề. Mỗi người một báo cáo cho mỗi video (báo lại thì đổi lý do). Đủ số người khác nhau báo
 * "cả video có vấn đề" thì video do người dùng thêm tự ẩn chờ admin xem (admin hiện lại hoặc bỏ qua báo cáo ở /admin/videos).
 * Lỗi: 400 invalid_request, 401 unauthorized, 404 not_found (không có hoặc đã ẩn), 429 user_limit.
 */
export async function POST(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return fail("not_found", 404);
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("invalid_request", 400);

  try {
    const sb = createSupabaseServiceClient();
    const { data: lesson, error } = await sb.from("video_lessons").select("status, added_by").eq("video_id", videoId).maybeSingle();
    if (error) throw new Error(`đọc video: ${error.message}`);
    const row = lesson as unknown as { status: LessonStatus; added_by: string | null } | null;
    if (!row || row.status === "hidden") return fail("not_found", 404);

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error: countError } = await sb.from("video_reports").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if (countError) throw new Error(`đếm báo cáo: ${countError.message}`);
    if ((count ?? 0) >= MAX_VIDEO_REPORTS_PER_USER_PER_DAY) return fail("user_limit", 429);

    // Báo lại cùng video thì đổi lý do và mở lại báo cáo (nếu admin đã bỏ qua trước đó).
    const saved = await sb.from("video_reports").upsert({ video_id: videoId, user_id: user.id, reason: parsed.data.reason, resolved_at: null }, { onConflict: "video_id,user_id" });
    if (saved.error) throw new Error(`ghi báo cáo: ${saved.error.message}`);

    if (shouldAutoHide({ openReports: await listOpenReports(videoId), status: row.status, addedByUser: row.added_by !== null })) {
      const { error: hideError } = await sb.from("video_lessons").update({ status: "hidden", updated_at: new Date().toISOString() }).eq("video_id", videoId).eq("status", "listed");
      if (hideError) throw new Error(`tự ẩn video: ${hideError.message}`);
      revalidatePath("/api/videos");
      revalidatePath(`/api/videos/${videoId}`);
    }
    return Response.json({ ok: true }, { status: 201, headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_report_error", videoId, message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}
