import { getCurrentUser } from "@/lib/auth/current-user";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET → góp ý của chính người đang xem (kể cả chưa duyệt), mới nhất trước. */
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return Response.json({ items: [] });

  const { data, error } = await createSupabaseServiceClient()
    .from("feedback")
    .select("id,category,message,status,created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  const items = (data ?? []).map((r) => ({ id: r.id, category: r.category, message: r.message, status: r.status, createdAt: r.created_at }));
  return Response.json({ items }, { headers: { "Cache-Control": "private, no-store" } });
}
