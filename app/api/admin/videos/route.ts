import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { countOpenReportsByVideo } from "@/lib/video/video-report-repo";
import { listAllLessons } from "@/lib/video/video-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → mọi video luyện nghe, mọi trạng thái, kèm số báo cáo chưa xử lý của người học (`openReportCount`) (chỉ quản trị viên). */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  try {
    const [lessons, reportCounts] = await Promise.all([listAllLessons(), countOpenReportsByVideo()]);
    const videos = lessons.map((v) => ({ ...v, openReportCount: reportCounts.get(v.videoId) ?? 0 }));
    return Response.json({ videos }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error(JSON.stringify({ event: "admin_videos_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
