import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";

export const runtime = "nodejs";

/** GET → { isAdmin }. Dùng để hiện/ẩn nút quản trị (ẩn/xóa bài Khám phá) phía client; quyền thật được kiểm lại ở từng route. */
export async function GET() {
  const user = await getCurrentUser();
  return Response.json({ isAdmin: isAdminAccount(user?.email ?? null) }, { headers: { "Cache-Control": "private, no-store" } });
}
