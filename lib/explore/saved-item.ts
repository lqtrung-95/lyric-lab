import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { SceneWord } from "./explore-types";

/**
 * Thẻ ôn (FSRS) cho một từ học ở cảnh Khám phá. Thẻ ôn cần một câu thật từ video/bài hát làm nguồn (mặt thẻ phát lại đúng đoạn đó), nên từ chưa có
 * câu thật trong chỉ mục thì trả null (giống chặng học). Nghĩa là nghĩa tiếng Việt ta viết cho vật.
 */
export function savedItemForWord(word: SceneWord, now = Date.now()): SavedItem | null {
  const ex = word.examples[0];
  if (!ex) return null;
  return {
    key: itemKey({ type: "vocab", term: word.term }), videoId: ex.videoId, type: "vocab", term: word.term, lineIndex: ex.lineIdx, start: ex.start, savedAt: now,
    reading: word.pinyin, sinoViet: word.sinoViet ?? undefined, level: word.hskLevel, meaning: word.gloss,
  };
}
