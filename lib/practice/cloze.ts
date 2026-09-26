import { shuffle, type Rng } from "./random";

export interface Cloze {
  before: string;
  after: string;
}

/** Đục lỗ câu hát tại lần xuất hiện đầu tiên của từ; null nếu từ không nằm nguyên trong câu (thẻ này không dùng được cho Điền lời). */
export function buildCloze(term: string, line: string): Cloze | null {
  if (!term) return null;
  const at = line.indexOf(term);
  return at < 0 ? null : { before: line.slice(0, at), after: line.slice(at + term.length) };
}

/**
 * Bốn đáp án cho ô trống: từ đúng và tối đa 3 từ nhiễu lấy từ các thẻ khác của người dùng. Ưu tiên từ cùng độ dài chữ,
 * loại từ trùng đáp án hoặc đã có sẵn trong câu (sẽ làm câu hỏi có hai đáp án đúng). Thứ tự ngẫu nhiên.
 */
export function buildChoices(target: string, pool: string[], lineText: string, rng?: Rng, count = 4): string[] {
  const candidates = [...new Set(pool)].filter((t) => t !== target && !lineText.includes(t));
  const sameLength = shuffle(candidates.filter((t) => [...t].length === [...target].length), rng);
  const others = shuffle(candidates.filter((t) => [...t].length !== [...target].length), rng);
  return shuffle([target, ...[...sameLength, ...others].slice(0, count - 1)], rng);
}
