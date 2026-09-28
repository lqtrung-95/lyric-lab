import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** GET → 50 góp ý mới nhất đã được duyệt, kèm biệt danh/avatar nếu người gửi có (dữ liệu chung, cache vài phút). */
export async function GET() {
  const { data, error } = await createSupabaseServiceClient()
    .from("feedback_public")
    .select("id,category,message,created_at,nickname,avatar_url")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  const items = (data ?? []).map((r) => ({
    id: r.id, category: r.category, message: r.message, createdAt: r.created_at,
    nickname: r.nickname, avatarUrl: r.avatar_url,
  }));
  return Response.json({ items }, { headers: { "Cache-Control": "public, s-maxage=120, stale-while-revalidate=300" } });
}
