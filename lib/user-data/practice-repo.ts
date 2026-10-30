import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { stripTermFromMeaning } from "@/lib/lookup/strip-term-from-meaning";
import { CARD_COLUMNS, type ReviewCard } from "./review-repo";

const MAX_POOL = 500;

/** Thẻ TỪ VỰNG của người dùng cho các chế độ luyện tập (tối đa 500, mới lưu trước; thẻ ngữ pháp và câu đã sửa chỉ ôn ở màn Ôn thẻ vì game cần từ ngắn). Rỗng nếu chưa có phiên. */
export async function loadPracticeCards(): Promise<{ userId: string | null; cards: ReviewCard[] }> {
  const sb = createSupabaseBrowserClient();
  const userId = (await sb.auth.getSession()).data.session?.user.id ?? null;
  if (!userId) return { userId: null, cards: [] };
  const { data, error } = await sb.from("user_cards").select(CARD_COLUMNS).eq("kind", "vocab").order("created_at", { ascending: false }).limit(MAX_POOL);
  if (error) throw new Error(error.message);
  // Nghĩa đã lưu từ trước có thể còn nhắc chữ Hán; trong bài tập nghĩa là gợi ý nên phải bỏ để không lộ đáp án.
  const cards = ((data ?? []) as ReviewCard[]).map((c) => ({ ...c, meaning: stripTermFromMeaning(c.meaning, c.term) }));
  return { userId, cards };
}
