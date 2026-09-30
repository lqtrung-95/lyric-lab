import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/**
 * PATCH { action: "hide" | "unhide" | "delete" } → quản trị viên ẩn/hiện lại bài ở Khám phá, hoặc xóa hẳn.
 * Xóa chỉ thực hiện khi không ai còn thẻ ôn hay tiến độ nghe từ bài đó; ngược lại tự chuyển thành ẩn để không mất dữ liệu người dùng.
 * /api/discover cache theo Cache-Control 5 phút (CDN) nên phải revalidate ngay, không thì bài vừa ẩn/xóa vẫn hiện tới khi cache hết hạn.
 */
export async function PATCH(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  const sb = createSupabaseServiceClient();

  if (body?.action === "hide" || body?.action === "unhide") {
    const { error } = await sb.from("songs").update({ listed: body.action === "unhide" }).eq("video_id", videoId);
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    revalidatePath("/api/discover");
    return Response.json({ done: body.action });
  }

  if (body?.action === "delete") {
    const count = async (table: string) => (await sb.from(table).select("*", { count: "exact", head: true }).eq("video_id", videoId)).count ?? 0;
    const inUse = (await count("user_cards")) + (await count("user_song_progress")) > 0;
    if (inUse) {
      await sb.from("songs").update({ listed: false }).eq("video_id", videoId);
      revalidatePath("/api/discover");
      return Response.json({ done: "hidden_instead", reason: "in_use" });
    }
    const { error } = await sb.from("songs").delete().eq("video_id", videoId);
    if (error) return Response.json({ error: "server_error" }, { status: 500 });
    revalidatePath("/api/discover");
    return Response.json({ done: "deleted" });
  }

  return Response.json({ error: "invalid_action" }, { status: 400 });
}
