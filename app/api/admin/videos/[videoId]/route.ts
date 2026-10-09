import { revalidatePath } from "next/cache";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { listTranslationReports, restoreTranslationFromReport } from "@/lib/video/translation-report-repo";
import { deleteLesson, editLessonTranslation, getLessonForAdmin, setLessonStatus } from "@/lib/video/video-repo";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function adminOr403() {
  const user = await getCurrentUser();
  return isAdminAccount(user?.email ?? null) ? null : Response.json({ error: "forbidden" }, { status: 403 });
}

/** GET → một video kèm toàn bộ dòng, mọi trạng thái, và các báo cáo bản dịch của nó (chỉ quản trị viên), để xem trước và rà bản dịch. */
export async function GET(_req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const denied = await adminOr403();
  if (denied) return denied;
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ error: "not_found" }, { status: 404 });
  try {
    const lesson = await getLessonForAdmin(videoId);
    return lesson ? Response.json({ ...lesson, reports: await listTranslationReports(videoId) }, { headers: { "Cache-Control": "private, no-store" } }) : Response.json({ error: "not_found" }, { status: 404 });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_video_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}

/**
 * PATCH { action: "list" | "hide" | "draft" } → đổi trạng thái (list = hiện cho người dùng, hide = ẩn, draft = về nháp).
 * PATCH { action: "edit_translation", idx, translation } → sửa bản dịch một dòng ("" = xóa bản dịch).
 * PATCH { action: "restore_translation", reportId } → trả bản dịch cũ của một báo cáo "AI đã dịch lại" (409 `unchanged` nếu dòng đã được sửa/khôi phục trước đó).
 * PATCH { action: "delete" } → xóa hẳn video (kèm cache nghĩa từ của nó).
 * API công khai cache ở edge nên mỗi thay đổi đều làm mới cache của danh sách và của video đó.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const denied = await adminOr403();
  if (denied) return denied;
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });
  const body = (await req.json().catch(() => null)) as { action?: string; idx?: unknown; translation?: unknown; reportId?: unknown } | null;

  try {
    let found = true;
    if (body?.action === "list" || body?.action === "hide" || body?.action === "draft") {
      found = await setLessonStatus(videoId, body.action === "list" ? "listed" : body.action === "hide" ? "hidden" : "draft");
    } else if (body?.action === "delete") {
      await deleteLesson(videoId);
    } else if (body?.action === "edit_translation") {
      if (!Number.isInteger(body.idx) || typeof body.translation !== "string") return Response.json({ error: "invalid_request" }, { status: 400 });
      const result = await editLessonTranslation(videoId, body.idx as number, body.translation);
      if (result === "invalid") return Response.json({ error: "invalid_translation" }, { status: 400 });
      found = result === "ok";
    } else if (body?.action === "restore_translation") {
      if (!Number.isInteger(body.reportId)) return Response.json({ error: "invalid_request" }, { status: 400 });
      const result = await restoreTranslationFromReport(videoId, body.reportId as number);
      if (result === "unchanged") return Response.json({ error: "unchanged" }, { status: 409 });
      found = result === "ok";
    } else {
      return Response.json({ error: "invalid_action" }, { status: 400 });
    }
    if (!found) return Response.json({ error: "not_found" }, { status: 404 });
    revalidatePath("/api/videos");
    revalidatePath(`/api/videos/${videoId}`);
    return Response.json({ done: body.action });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_video_update_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
