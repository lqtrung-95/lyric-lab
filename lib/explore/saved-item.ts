import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { SceneWord } from "./explore-types";

/** Từ có câu thật (từ video/bài hát đã duyệt) để làm nguồn nghe lại đoạn không. */
export const wordHasSource = (word: SceneWord): boolean => word.examples.length > 0;

/**
 * Thẻ ôn (FSRS) cho một từ học ở cảnh Khám phá. Có câu thật thì thẻ trỏ về đoạn video/bài hát đó (mặt thẻ nghe lại đúng đoạn);
 * chưa có thì vẫn tạo được thẻ không nguồn (videoId rỗng, lưu null ở bảng thẻ): mặt thẻ chỉ có chữ, pinyin, nghĩa Việt ta viết cho vật, không có nút nghe lại đoạn.
 */
export function savedItemForWord(word: SceneWord, now = Date.now()): SavedItem {
  const ex = word.examples[0];
  return {
    key: itemKey({ type: "vocab", term: word.term }), videoId: ex?.videoId ?? "", type: "vocab", term: word.term, lineIndex: ex?.lineIdx ?? 0, start: ex?.start ?? 0, savedAt: now,
    reading: word.pinyin, sinoViet: word.sinoViet ?? undefined, level: word.hskLevel, meaning: word.gloss,
  };
}
