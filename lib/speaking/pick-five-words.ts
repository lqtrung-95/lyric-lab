import { pickPracticeCards, type PoolCard } from "@/lib/practice/pick-practice-cards";
import type { Rng } from "@/lib/practice/random";
import { hanChars } from "./reply-match";

export const FIVE_WORD_COUNT = 5;

interface WordCard extends PoolCard { kind: string; term: string }

/** Từ hợp để ép dùng trong câu: từ vựng chỉ gồm chữ Hán, 2–4 chữ (một chữ đơn quá dễ lọt vào câu bất kỳ, cụm dài quá khó nhớ nguyên). */
const usable = (c: WordCard): boolean => c.kind === "vocab" && c.term === hanChars(c.term).join("") && hanChars(c.term).length >= 2 && hanChars(c.term).length <= 4;

/** Chọn 5 từ cho một bộ Dùng 5 từ: ưu tiên thẻ đã đến hạn ôn (xem `pickPracticeCards`) để việc dùng từ trong câu thật cũng củng cố lịch ôn. Ít hơn 5 thì trả những gì có. */
export function pickFiveWords<T extends WordCard>(cards: readonly T[], now: Date, rng?: Rng): T[] {
  return pickPracticeCards(cards.filter(usable), FIVE_WORD_COUNT, now, rng);
}
