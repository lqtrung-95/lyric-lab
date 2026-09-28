import { getCurrentUser } from "@/lib/auth/current-user";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

/** GET → danh sách góp ý dịch đang chờ duyệt (mới nhất trước), kèm tên bài để admin biết đang xem câu của bài nào. */
export async function GET() {
  const user = await getCurrentUser();
  if (!isAdminAccount(user?.email ?? null)) return Response.json({ error: "forbidden" }, { status: 403 });

  const sb = createSupabaseServiceClient();
  const { data, error } = await sb
    .from("translation_suggestions")
    .select("id,video_id,prompt_version,line_index,current_translation,suggested_translation,created_at,songs(title)")
    .eq("status", "pending")
    .order("created_at", { ascending: false })
    .limit(100);
  if (error) return Response.json({ error: "server_error" }, { status: 500 });

  const items = (data ?? []).map((r) => ({
    id: r.id, videoId: r.video_id, promptVersion: r.prompt_version, lineIndex: r.line_index,
    currentTranslation: r.current_translation, suggestedTranslation: r.suggested_translation, createdAt: r.created_at,
    songTitle: (r.songs as unknown as { title: string } | null)?.title ?? r.video_id,
  }));
  return Response.json({ items });
}
