import { chunkSentence } from "./quiz-extra";
import type { UnitWord } from "./unit-types";

export type QuizKind = "meaning" | "term" | "listen" | "pinyin" | "cloze" | "match" | "order" | "type" | "tf";
export interface QuizOption { term: string; label: string }
export interface QuizQuestion {
  kind: QuizKind;
  /** Từ là đáp án đúng (với "match": từ chính của câu; các từ còn lại nằm trong `pairs`). */
  term: string;
  /** Câu hỏi hiển thị (chữ Hán cho "meaning", "pinyin" và "tf", nghĩa Việt cho "term", câu thật có chỗ trống cho "cloze", câu thật nguyên vẹn cho "order", rỗng cho "listen", "match" và "type"). */
  prompt: string;
  /** Gợi ý phụ: bản dịch tiếng Việt của câu cho "cloze" và "order". */
  hint?: string;
  /** Các lựa chọn của kiểu trắc nghiệm (rỗng với "match", "order", "type", "tf"). */
  options: QuizOption[];
  answer: string;
  /** "match": các cặp chữ Hán ↔ nghĩa cần ghép. */
  pairs?: QuizOption[];
  /** "order": các mảnh đã xáo, và câu đúng (không dấu câu) để so. */
  chunks?: string[];
  sentence?: string;
  /** "tf": nghĩa đang hiển thị cạnh chữ Hán và nó có đúng không. */
  shown?: string;
  truth?: boolean;
}

export const QUIZ_LENGTH = 10;
/** Kiểu trắc nghiệm cổ điển (mặc định của `buildUnitQuiz`). */
export const CHOICE_KINDS: QuizKind[] = ["meaning", "term", "listen"];
/**
 * Bài kiểm tra chặng học: xen kẽ trắc nghiệm với ghép cặp, đúng/sai, sắp xếp câu và nghe gõ pinyin (kiểu nào không dựng được cho từ đó thì đổi sang chữ→nghĩa).
 * Chặng ôn tổng hợp thêm "chọn pinyin" và "điền chỗ trống từ câu thật".
 */
export const UNIT_QUIZ_KINDS: QuizKind[] = ["meaning", "match", "listen", "tf", "order", "term", "type", "match", "listen", "order"];
export const REVIEW_QUIZ_KINDS: QuizKind[] = ["meaning", "cloze", "match", "listen", "pinyin", "order", "tf", "term", "type"];
export const CLOZE_BLANK = "＿＿";
export const PASS_PERCENT = 70;
const OPTIONS = 4;
const MIN_PAIRS = 3;
const MAX_PAIRS = 4;

/** Nghĩa hiển thị: nghĩa tiếng Việt đã duyệt; chưa có thì lấy nghĩa tiếng Anh đầu tiên. */
export const wordLabel = (w: UnitWord): string => w.gloss ?? w.meanings[0] ?? w.term;

type Random = () => number;
const shuffled = <T,>(items: T[], random: Random): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/** Các từ khác có nhãn khác nhau đôi một và khác `word` (theo `keyOf`), xáo ngẫu nhiên, tối đa `max`. */
function distinctOthers(word: UnitWord, usable: UnitWord[], keyOf: (w: UnitWord) => string, random: Random, max: number): UnitWord[] {
  const seen = new Set([keyOf(word)]);
  return shuffled(usable.filter((w) => w.term !== word.term), random).filter((w) => !seen.has(keyOf(w)) && !!seen.add(keyOf(w))).slice(0, max);
}

/** Câu trắc nghiệm 4 lựa chọn (chữ→nghĩa, nghĩa→chữ, nghe→chữ, chọn pinyin, điền chỗ trống). Null nếu thiếu đáp án nhiễu. */
function choiceQuestion(kind: QuizKind, word: UnitWord, usable: UnitWord[], random: Random): QuizQuestion | null {
  const example = word.examples.find((e) => e.text.includes(word.term));
  if (kind === "cloze" && !example) return null;
  const labelOf = (w: UnitWord) => (kind === "meaning" ? wordLabel(w) : kind === "pinyin" ? w.pinyin : w.term);
  // Đáp án nhiễu khác nhau đôi một theo thứ làm hai lựa chọn có thể cùng đúng: cùng pinyin (câu hỏi pinyin) hoặc cùng nghĩa hiển thị (các câu còn lại).
  const keyOf = (w: UnitWord) => (kind === "pinyin" ? w.pinyin : wordLabel(w));
  const distractors = distinctOthers(word, usable, keyOf, random, OPTIONS - 1);
  if (distractors.length === 0) return null;
  const options = shuffled([word, ...distractors], random).map((w) => ({ term: w.term, label: labelOf(w) }));
  const q: QuizQuestion = { kind, term: word.term, prompt: "", options, answer: word.term };
  if (kind === "meaning" || kind === "pinyin") q.prompt = word.term;
  else if (kind === "term") q.prompt = wordLabel(word);
  else if (kind === "cloze" && example) { q.prompt = example.text.replace(word.term, CLOZE_BLANK); q.hint = example.translation; }
  return q;
}

/** Ghép cặp: 3-4 từ (gồm từ chính) với nghĩa; các nghĩa phải khác nhau để mỗi cặp chỉ có một đáp án. */
function matchQuestion(word: UnitWord, usable: UnitWord[], random: Random): QuizQuestion | null {
  const others = distinctOthers(word, usable, wordLabel, random, MAX_PAIRS - 1);
  if (others.length + 1 < MIN_PAIRS) return null;
  const pairs = [word, ...others].map((w) => ({ term: w.term, label: wordLabel(w) }));
  return { kind: "match", term: word.term, prompt: "", options: [], answer: word.term, pairs };
}

/** Sắp xếp câu: dùng một câu thật chứa từ này, cắt thành 3-8 mảnh rồi xáo (không để nguyên thứ tự đúng). */
function orderQuestion(word: UnitWord, usable: UnitWord[], random: Random): QuizQuestion | null {
  const terms = usable.map((w) => w.term);
  for (const example of word.examples) {
    if (!example.text.includes(word.term)) continue;
    const chunks = chunkSentence(example.text, terms);
    if (!chunks) continue;
    let mix = shuffled(chunks, random);
    if (mix.join("|") === chunks.join("|")) mix = [...mix.slice(1), mix[0]];
    return { kind: "order", term: word.term, prompt: example.text, hint: example.translation, options: [], answer: word.term, chunks: mix, sentence: chunks.join("") };
  }
  return null;
}

/** Nghe và gõ pinyin của từ. */
const typeQuestion = (word: UnitWord): QuizQuestion | null => (word.pinyin ? { kind: "type", term: word.term, prompt: "", options: [], answer: word.term } : null);

/** Đúng/sai: chữ Hán kèm nghĩa thật của nó (một nửa số câu) hoặc nghĩa của một từ khác. */
function trueFalseQuestion(word: UnitWord, usable: UnitWord[], random: Random): QuizQuestion | null {
  const truth = random() < 0.5;
  const other = distinctOthers(word, usable, wordLabel, random, 1)[0];
  if (!truth && !other) return null;
  return { kind: "tf", term: word.term, prompt: word.term, options: [], answer: word.term, shown: truth ? wordLabel(word) : wordLabel(other), truth };
}

function makeQuestion(kind: QuizKind, word: UnitWord, usable: UnitWord[], random: Random): QuizQuestion | null {
  switch (kind) {
    case "match": return matchQuestion(word, usable, random);
    case "order": return orderQuestion(word, usable, random);
    case "type": return typeQuestion(word);
    case "tf": return trueFalseQuestion(word, usable, random);
    default: return choiceQuestion(kind, word, usable, random);
  }
}

/**
 * Bài kiểm tra chặng: tối đa `QUIZ_LENGTH` câu, xoay đều các kiểu trong `kinds`, mỗi từ tối đa một lần cho đến khi hết từ rồi mới lặp.
 * Kiểu nào không dựng được cho từ đó (thiếu câu thật, thiếu từ để ghép…) thì đổi sang chữ→nghĩa; không dựng được nữa thì bỏ câu.
 * Đáp án nhiễu lấy từ các từ khác của chặng, bỏ từ có cùng nghĩa hiển thị để không có hai đáp án đúng. `random` truyền vào để test cố định.
 */
export function buildUnitQuiz(words: UnitWord[], random: Random = Math.random, length = QUIZ_LENGTH, kinds: QuizKind[] = CHOICE_KINDS): QuizQuestion[] {
  const usable = words.filter((w) => w.pinyin);
  if (usable.length < 2) return [];
  const order = shuffled(usable, random);
  const count = Math.min(length, Math.max(usable.length, 2) * 2);
  const questions: QuizQuestion[] = [];
  for (let i = 0; i < count; i++) {
    const word = order[i % order.length];
    const q = makeQuestion(kinds[i % kinds.length], word, usable, random) ?? makeQuestion("meaning", word, usable, random);
    if (q) questions.push(q);
  }
  return questions;
}

/** Điểm phần trăm (làm tròn) và đạt hay chưa theo ngưỡng `PASS_PERCENT`. */
export function gradeQuiz(correct: number, total: number): { percent: number; passed: boolean } {
  const percent = total === 0 ? 0 : Math.round((100 * correct) / total);
  return { percent, passed: percent >= PASS_PERCENT };
}
