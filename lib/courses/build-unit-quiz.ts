import type { UnitWord } from "./unit-types";

export type QuizKind = "meaning" | "term" | "listen" | "pinyin" | "cloze";
export interface QuizOption { term: string; label: string }
export interface QuizQuestion {
  kind: QuizKind;
  /** Từ là đáp án đúng. */
  term: string;
  /** Câu hỏi hiển thị (chữ Hán cho "meaning" và "pinyin", nghĩa Việt cho "term", câu thật có chỗ trống cho "cloze", rỗng cho "listen": phát âm thanh). */
  prompt: string;
  /** Gợi ý phụ: bản dịch tiếng Việt của câu cho "cloze". */
  hint?: string;
  options: QuizOption[];
  answer: string;
}

export const QUIZ_LENGTH = 10;
/** Ba kiểu của bài kiểm tra chặng học; chặng ôn tổng hợp thêm "chọn pinyin" và "điền chỗ trống từ câu thật". */
export const UNIT_QUIZ_KINDS: QuizKind[] = ["meaning", "term", "listen"];
export const REVIEW_QUIZ_KINDS: QuizKind[] = ["meaning", "cloze", "listen", "pinyin", "term"];
export const CLOZE_BLANK = "＿＿";
export const PASS_PERCENT = 70;
const OPTIONS = 4;

/** Nghĩa hiển thị: nghĩa tiếng Việt đã duyệt; chưa có thì lấy nghĩa tiếng Anh đầu tiên. */
export const wordLabel = (w: UnitWord): string => w.gloss ?? w.meanings[0] ?? w.term;

type Random = () => number;
const shuffled = <T,>(items: T[], random: Random): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/**
 * Bài kiểm tra chặng: tối đa `QUIZ_LENGTH` câu, xoay đều ba kiểu (chữ→nghĩa, nghĩa→chữ, nghe→chữ), mỗi từ tối đa một lần cho đến khi hết từ rồi mới lặp.
 * Đáp án nhiễu lấy từ các từ khác của chặng, bỏ từ có cùng nghĩa hiển thị để không có hai đáp án đúng. `random` truyền vào để test cố định.
 */
export function buildUnitQuiz(words: UnitWord[], random: Random = Math.random, length = QUIZ_LENGTH, kinds: QuizKind[] = UNIT_QUIZ_KINDS): QuizQuestion[] {
  const usable = words.filter((w) => w.pinyin);
  if (usable.length < 2) return [];
  const order = shuffled(usable, random);
  const count = Math.min(length, Math.max(usable.length, 2) * 2);
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const word = order[i % order.length];
    const preferred = kinds[i % kinds.length];
    // Câu điền chỗ trống cần một câu thật chứa từ này; không có thì đổi sang kiểu chữ→nghĩa.
    const example = word.examples.find((e) => e.text.includes(word.term));
    const kind: QuizKind = preferred === "cloze" && !example ? "meaning" : preferred;
    const labelOf = (w: UnitWord) => (kind === "meaning" ? wordLabel(w) : kind === "pinyin" ? w.pinyin : w.term);
    // Đáp án nhiễu khác đáp án đúng và khác nhau đôi một theo thứ làm hai lựa chọn có thể cùng đúng: cùng pinyin (câu hỏi pinyin) hoặc cùng nghĩa hiển thị (các câu còn lại).
    const keyOf = (w: UnitWord) => (kind === "pinyin" ? w.pinyin : wordLabel(w));
    const seenKeys = new Set([keyOf(word)]);
    const distractors = shuffled(usable.filter((w) => w.term !== word.term), random).filter((w) => !seenKeys.has(keyOf(w)) && !!seenKeys.add(keyOf(w))).slice(0, OPTIONS - 1);
    if (distractors.length === 0) continue;
    const options = shuffled([word, ...distractors], random).map((w) => ({ term: w.term, label: labelOf(w) }));
    const q: QuizQuestion = { kind, term: word.term, prompt: "", options, answer: word.term };
    if (kind === "meaning" || kind === "pinyin") q.prompt = word.term;
    else if (kind === "term") q.prompt = wordLabel(word);
    else if (kind === "cloze" && example) { q.prompt = example.text.replace(word.term, CLOZE_BLANK); q.hint = example.translation; }
    questions.push(q);
  }
  return questions;
}

/** Điểm phần trăm (làm tròn) và đạt hay chưa theo ngưỡng `PASS_PERCENT`. */
export function gradeQuiz(correct: number, total: number): { percent: number; passed: boolean } {
  const percent = total === 0 ? 0 : Math.round((100 * correct) / total);
  return { percent, passed: percent >= PASS_PERCENT };
}
