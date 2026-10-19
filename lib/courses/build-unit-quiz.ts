import type { UnitWord } from "./unit-types";

export type QuizKind = "meaning" | "term" | "listen";
export interface QuizOption { term: string; label: string }
export interface QuizQuestion {
  kind: QuizKind;
  /** Từ là đáp án đúng. */
  term: string;
  /** Câu hỏi hiển thị (chữ Hán cho "meaning", nghĩa Việt cho "term", rỗng cho "listen": phát âm thanh). */
  prompt: string;
  options: QuizOption[];
  answer: string;
}

export const QUIZ_LENGTH = 10;
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
export function buildUnitQuiz(words: UnitWord[], random: Random = Math.random, length = QUIZ_LENGTH): QuizQuestion[] {
  const usable = words.filter((w) => w.pinyin);
  if (usable.length < 2) return [];
  const kinds: QuizKind[] = ["meaning", "term", "listen"];
  const order = shuffled(usable, random);
  const count = Math.min(length, Math.max(usable.length, 2) * 2);
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const word = order[i % order.length];
    const kind = kinds[i % kinds.length];
    // Đáp án nhiễu khác nghĩa hiển thị với đáp án đúng và khác nhau đôi một: không để hai lựa chọn cùng nghĩa.
    const seenLabels = new Set([wordLabel(word)]);
    const distractors = shuffled(usable.filter((w) => w.term !== word.term), random).filter((w) => !seenLabels.has(wordLabel(w)) && !!seenLabels.add(wordLabel(w))).slice(0, OPTIONS - 1);
    if (distractors.length === 0) continue;
    const options = shuffled([word, ...distractors], random).map((w) => ({ term: w.term, label: kind === "meaning" ? wordLabel(w) : w.term }));
    questions.push({ kind, term: word.term, prompt: kind === "meaning" ? word.term : kind === "term" ? wordLabel(word) : "", options, answer: word.term });
  }
  return questions;
}

/** Điểm phần trăm (làm tròn) và đạt hay chưa theo ngưỡng `PASS_PERCENT`. */
export function gradeQuiz(correct: number, total: number): { percent: number; passed: boolean } {
  const percent = total === 0 ? 0 : Math.round((100 * correct) / total);
  return { percent, passed: percent >= PASS_PERCENT };
}
