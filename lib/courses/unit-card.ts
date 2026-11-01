import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { UnitWord } from "./unit-types";

/**
 * Thẻ ôn (FSRS) cho một từ của chặng. Từ có câu thật thì lấy câu đầu làm nguồn (mặt thẻ nghe lại được đúng đoạn); từ chưa có câu thật vẫn có thẻ, chỉ là không có nguồn
 * (videoId rỗng), nên MỌI từ của chặng đều vào được bộ ôn.
 */
export function unitCardItem(word: UnitWord, now = Date.now()): SavedItem {
  const ex = word.examples[0];
  return {
    key: itemKey({ type: "vocab", term: word.term }), videoId: ex?.videoId ?? "", type: "vocab", term: word.term, lineIndex: ex?.lineIdx ?? 0, start: ex?.start ?? 0, savedAt: now,
    reading: word.pinyin, sinoViet: word.sinoViet ?? undefined, level: word.hskLevel, meaning: word.gloss ?? word.meanings[0],
  };
}

/** Các thẻ cần thêm sau một lượt kiểm tra: đạt thì cả chặng, chưa đạt thì chỉ các từ làm sai; bỏ những thẻ đã có trong bộ ôn. */
export function cardsToAdd(words: readonly UnitWord[], wrongTerms: readonly string[], passed: boolean, haveKeys: ReadonlySet<string>, now = Date.now()): SavedItem[] {
  const picked = passed ? words : words.filter((w) => wrongTerms.includes(w.term));
  return picked.map((w) => unitCardItem(w, now)).filter((c) => !haveKeys.has(c.key));
}
