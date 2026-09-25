import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** POST → xóa toàn bộ dữ liệu của người dùng hiện tại (AC-04): xóa tài khoản, các bảng `user_*` xóa theo (on delete cascade). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const { error } = await createSupabaseServiceClient().auth.admin.deleteUser(user.id);
  if (error) {
    console.error(JSON.stringify({ event: "delete_account_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ deleted: true });
}
