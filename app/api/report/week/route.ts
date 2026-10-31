import { getCurrentUser } from "@/lib/auth/current-user";
import { loadWeekReport } from "@/lib/report/load-week-report";

export const runtime = "nodejs";

/** GET → báo cáo 7 ngày gần nhất của người dùng hiện tại (không lưu đệm: số liệu thay đổi sau mỗi lượt học). */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  try {
    return Response.json(await loadWeekReport(user.id), { headers: { "Cache-Control": "private, no-store" } });
  } catch {
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
