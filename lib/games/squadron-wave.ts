import type { GameWord } from "./game-word";
import { BOSS_EVERY, BOSS_HP, type Enemy, type Question, type QuestionKind } from "./squadron-types";

const SIZE = 4;
const keyOf = (kind: QuestionKind, w: GameWord): string => (kind === "meaning" ? w.meaning ?? "" : w.pinyin);

function shuffle<T>(items: T[], rng: () => number): T[] {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

/**
 * Một đợt: chọn câu hỏi (nghĩa hoặc pinyin), 1 máy bay mang chữ đúng và tối đa 3 máy bay mang chữ nhiễu, xếp ngang đều nhau theo thứ tự ngẫu nhiên.
 * Chữ nhiễu không trùng đáp án ở chính thứ được hỏi (cùng nghĩa hay cùng pinyin) nên luôn chỉ có một đáp án đúng. Đợt thứ `asked + 1` chia hết cho BOSS_EVERY là trùm: to, nhiều máu, thưởng gấp ba.
 * Trả null nếu kho từ quá nhỏ để ghép đợt.
 */
export function makeWave(pool: readonly GameWord[], rng: () => number, asked: number, lastHan: string, firstId: number): { question: Question; enemies: Enemy[]; nextId: number } | null {
  const withMeaning = pool.filter((w) => w.meaning);
  const kind: QuestionKind = withMeaning.length >= SIZE && rng() < 0.5 ? "meaning" : "pinyin";
  const usable = (kind === "meaning" ? withMeaning : pool).filter((w) => w.han !== lastHan);
  if (usable.length === 0) return null;
  const answer = usable[Math.floor(rng() * usable.length)];
  const seen = new Set([answer.han]);
  const distractors = shuffle(pool.filter((w) => keyOf(kind, w) && keyOf(kind, w) !== keyOf(kind, answer)), rng).filter((w) => !seen.has(w.han) && !!seen.add(w.han)).slice(0, SIZE - 1);
  if (distractors.length < 2) return null;
  const boss = (asked + 1) % BOSS_EVERY === 0;
  const lineup = shuffle([answer, ...distractors], rng);
  const enemies = lineup.map((word, i): Enemy => {
    const correct = word.han === answer.han;
    const hp = correct && boss ? BOSS_HP : 1;
    return { id: firstId + i, word, x: (i + 1) / (lineup.length + 1), y: -0.1, correct, boss: correct && boss, hp, maxHp: hp, flash: 0 };
  });
  const prompt = kind === "meaning" ? (answer.meaning ?? "") : answer.pinyin;
  return { question: { kind, prompt, answer }, enemies, nextId: firstId + lineup.length };
}
