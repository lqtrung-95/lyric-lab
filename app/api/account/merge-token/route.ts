import { getCurrentUser } from "@/lib/auth/current-user";
import { createMergeToken } from "@/lib/account/merge-account";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** POST → mã một lần cho tài khoản ẩn danh hiện tại (chứng minh quyền sở hữu dữ liệu khi gộp vào tài khoản Google đã có). */
export async function POST() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!user.isAnonymous) return Response.json({ error: "not_anonymous" }, { status: 400 });
  return Response.json({ token: await createMergeToken(createSupabaseServiceClient(), user.id) }, { headers: { "Cache-Control": "no-store" } });
}
