import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { getCurrentUser } from "@/lib/auth/current-user";
import { countOpenReportsByVideo } from "@/lib/video/video-report-repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → số video đang bị người học báo (còn báo cáo chưa xử lý) và tổng số báo cáo đó, cho huy hiệu ở trang quản trị (chỉ quản trị viên). */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });
  const counts = await countOpenReportsByVideo();
  return Response.json({ videos: counts.size, reports: [...counts.values()].reduce((a, b) => a + b, 0) }, { headers: { "Cache-Control": "private, no-store" } });
}
