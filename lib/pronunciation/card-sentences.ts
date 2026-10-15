import { MAX_ASSESS_CHARS, toReferenceText } from "./assess-request-schema";
import type { ReadAloudSentence } from "./read-aloud-sentences";

interface CardLike { kind: "vocab" | "grammar"; term: string; pinyin: string | null; meaning: string }

/**
 * Chọn tối đa `count` từ vựng đã lưu để luyện đọc to: chỉ lấy từ vựng có chữ Hán, đủ ngắn để chấm, không trùng; thứ tự ngẫu nhiên (`random` truyền vào để test).
 * Thẻ ngữ pháp bị bỏ vì mẫu câu có chỗ trống/ký hiệu, không đọc thành câu trọn vẹn.
 */
export function pickSentencesFromCards(cards: CardLike[], count = 8, random: () => number = Math.random): ReadAloudSentence[] {
  const seen = new Set<string>();
  const usable: ReadAloudSentence[] = [];
  for (const c of cards) {
    const han = toReferenceText(c.term);
    if (c.kind !== "vocab" || !han || han.length > MAX_ASSESS_CHARS || seen.has(han)) continue;
    seen.add(han);
    usable.push({ han: c.term.trim(), pinyin: c.pinyin ?? "", meaning: c.meaning });
  }
  return usable.sort(() => random() - 0.5).slice(0, count);
}
