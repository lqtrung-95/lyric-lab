import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { CARD_COLUMNS, type ReviewCard } from "./review-repo";

const MAX_POOL = 500;

/** Thẻ của người dùng cho các chế độ luyện tập (tối đa 500, mới lưu trước). Rỗng nếu chưa có phiên. */
export async function loadPracticeCards(): Promise<{ userId: string | null; cards: ReviewCard[] }> {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id ?? null;
  if (!userId) return { userId: null, cards: [] };
  const { data, error } = await sb.from("user_cards").select(CARD_COLUMNS).order("created_at", { ascending: false }).limit(MAX_POOL);
  if (error) throw new Error(error.message);
  return { userId, cards: (data ?? []) as ReviewCard[] };
}
