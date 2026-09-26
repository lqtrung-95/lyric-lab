import { shortMeaning } from "./match-round";
import { shuffle, type Rng } from "./random";

export interface MeaningOption {
  /** Khóa của thẻ mà nghĩa này thuộc về (để biết đáp án nào đúng). */
  key: string;
  text: string;
}

/**
 * Bốn đáp án nghĩa cho một từ: nghĩa đúng và tối đa 3 nghĩa nhiễu của các thẻ khác. Dùng nghĩa ngắn gọn, bỏ nghĩa trùng
 * đáp án (hai từ đồng nghĩa sẽ làm câu hỏi có hai đáp án đúng) và ưu tiên nghĩa ngắn thay vì câu giải thích dài.
 */
export function buildMeaningChoices(
  target: { item_key: string; meaning: string },
  pool: { item_key: string; meaning: string }[],
  rng?: Rng,
  count = 4,
): MeaningOption[] {
  const correct = shortMeaning(target.meaning);
  const seen = new Set([correct.toLowerCase()]);
  const distractors: MeaningOption[] = [];
  const candidates = shuffle(pool.filter((c) => c.item_key !== target.item_key), rng)
    .map((c) => ({ key: c.item_key, text: shortMeaning(c.meaning) }))
    .filter((c) => c.text)
    .sort((a, b) => Number(a.text.length > 30) - Number(b.text.length > 30)); // nghĩa ngắn gọn trước, câu dài để cuối
  for (const c of candidates) {
    const norm = c.text.toLowerCase();
    if (seen.has(norm)) continue;
    seen.add(norm);
    distractors.push(c);
    if (distractors.length === count - 1) break;
  }
  return shuffle([{ key: target.item_key, text: correct }, ...distractors], rng);
}
