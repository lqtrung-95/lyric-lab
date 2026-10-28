import { shuffle, type Rng } from "@/lib/practice/random";
import type { DialogueDef } from "@/lib/dialogues/dialogue-types";
import { hanChars } from "./reply-match";

/** Một câu hỏi của bài Hỏi nhanh – Đáp nhanh, lấy từ một lượt hỏi–đáp có thật trong hội thoại tự viết. `a` là câu đáp mẫu (một cách đáp, không phải đáp án duy nhất). */
export interface ReflexItem { id: string; q: string; qVi: string; a: string; aVi: string; dialogueId: string }

const QUESTION_WORDS = /[吗呢什么哪几谁怎多为]/u;
const MAX_Q_HAN = 18;
const MIN_A_HAN = 2;
const MAX_A_HAN = 22;

const isQuestion = (zh: string) => /[？?]\s*$/.test(zh) || QUESTION_WORDS.test(zh);

/** Mọi cặp (hỏi → đáp của người kia) dùng được trong một hội thoại: câu hỏi ngắn, câu đáp có 2–22 chữ Hán và không phải câu hỏi ngược. */
export function questionPairs(d: DialogueDef): ReflexItem[] {
  const out: ReflexItem[] = [];
  for (let i = 0; i < d.lines.length - 1; i++) {
    const q = d.lines[i], a = d.lines[i + 1];
    if (q.who === a.who || !isQuestion(q.zh) || isQuestion(a.zh)) continue;
    if (hanChars(q.zh).length > MAX_Q_HAN) continue;
    const aHan = hanChars(a.zh).length;
    if (aHan < MIN_A_HAN || aHan > MAX_A_HAN) continue;
    out.push({ id: `${d.id}#${i}`, q: q.zh, qVi: q.vi, a: a.zh, aVi: a.vi, dialogueId: d.id });
  }
  return out;
}

/**
 * Chọn `count` câu cho một lượt: ưu tiên mỗi hội thoại một câu (đa dạng chủ đề), thiếu thì bù thêm từ các câu còn lại. Chỉ lấy hội thoại có cấp ≤ `maxLevel`
 * hoặc chưa biết cấp (`levels` bản đồ id → cấp HSK).
 */
export function pickReflexItems(dialogues: readonly DialogueDef[], levels: ReadonlyMap<string, number | null>, count: number, maxLevel: number, rng: Rng = Math.random): ReflexItem[] {
  const eligible = dialogues.filter((d) => (levels.get(d.id) ?? 1) <= maxLevel);
  const perDialogue = shuffle(eligible, rng).map((d) => shuffle(questionPairs(d), rng)).filter((p) => p.length > 0);
  const first = perDialogue.map((p) => p[0]);
  const rest = shuffle(perDialogue.flatMap((p) => p.slice(1)), rng);
  return [...first, ...rest].slice(0, count);
}
