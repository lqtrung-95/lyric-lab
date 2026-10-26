import type { ExampleSentence } from "@/lib/courses/course-types";
import { itemKey, type SavedItem } from "@/lib/user-state/learner-state";
import type { WordDetail } from "./word-detail-types";

/**
 * Thẻ ôn (FSRS) cho từ đang xem. Thẻ cần một câu thật làm nguồn (mặt thẻ phát lại đúng đoạn video), nên chưa có câu thì trả null.
 * `meaning` ưu tiên nghĩa Việt đã duyệt, rồi nghĩa AI đã có, cuối cùng nghĩa tiếng Anh đầu tiên của từ điển.
 */
export function savedItemForDetail(detail: WordDetail, example: ExampleSentence | undefined, aiGloss: string | null, now = Date.now()): SavedItem | null {
  if (!example) return null;
  const main = detail.readings[0];
  return {
    key: itemKey({ type: "vocab", term: detail.simplified }), videoId: example.videoId, type: "vocab", term: detail.simplified,
    lineIndex: example.lineIdx, start: example.start, savedAt: now,
    reading: main.pinyin, sinoViet: detail.sinoViet ?? undefined, level: detail.hskLevel,
    meaning: detail.gloss ?? aiGloss ?? main.meanings[0] ?? "",
  };
}
