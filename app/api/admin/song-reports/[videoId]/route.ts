import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { dismissSongReports } from "@/lib/admin/song-reports";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";

/** PATCH { action: "dismiss" } → đánh dấu đã xử lý: xóa mọi báo cáo của bài. Không tự hiện lại bài đang ẩn (dùng nút Hiện lại ở /api/admin/songs). */
export async function PATCH(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return Response.json({ error: "invalid_video" }, { status: 400 });
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const body = (await req.json().catch(() => null)) as { action?: string } | null;
  if (body?.action !== "dismiss") return Response.json({ error: "invalid_action" }, { status: 400 });
  try {
    const removed = await dismissSongReports(videoId);
    revalidatePath("/api/discover"); // Khám phá loại bài theo số báo cáo: xóa báo cáo có thể đưa bài trở lại ngay
    return Response.json({ done: "dismissed", removed });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
