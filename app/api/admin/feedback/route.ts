import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** GET → góp ý đang chờ duyệt (mới nhất trước), để admin duyệt cho hiện công khai. */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const { data, error } = await createSupabaseServiceClient()
    .from("feedback")
    .select("id,category,message,page_url,created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  const items = (data ?? []).map((r) => ({ id: r.id, category: r.category, message: r.message, pageUrl: r.page_url, createdAt: r.created_at }));
  return Response.json({ items });
}
