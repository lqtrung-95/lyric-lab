export interface PlacementWord { term: string; pinyin: string; gloss: string }
export interface PlacementQuestion {
  level: number;
  term: string;
  pinyin: string;
  /** Nghĩa đúng và các nghĩa nhiễu, đã xáo; luôn có thêm lựa chọn "Chưa biết" ở giao diện (không nằm trong mảng này). */
  options: string[];
  answer: string;
}

export const PLACEMENT_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export const QUESTIONS_PER_LEVEL = 5;
/** Tỉ lệ đúng tối thiểu để coi là "nắm" một cấp. */
export const PLACEMENT_PASS_RATIO = 0.6;
const OPTIONS = 4;

type Random = () => number;
const shuffled = <T,>(items: T[], random: Random): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

/**
 * Dựng bài xếp lớp: mỗi cấp `QUESTIONS_PER_LEVEL` câu "chữ Hán → nghĩa" (đáp án nhiễu lấy từ nghĩa của từ khác cùng cấp, khác nghĩa đúng), xếp từ cấp thấp lên cao.
 * Cấp không đủ từ thì bỏ qua cấp đó. `random` truyền vào để test cố định.
 */
export function buildPlacementQuestions(byLevel: Record<number, PlacementWord[]>, random: Random = Math.random): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  for (const level of PLACEMENT_LEVELS) {
    const pool = byLevel[level] ?? [];
    if (pool.length < OPTIONS) continue;
    for (const w of shuffled(pool, random).slice(0, QUESTIONS_PER_LEVEL)) {
      const wrong = [...new Set(shuffled(pool, random).filter((x) => x.gloss !== w.gloss).map((x) => x.gloss))].slice(0, OPTIONS - 1);
      if (wrong.length < OPTIONS - 1) continue;
      out.push({ level, term: w.term, pinyin: w.pinyin, options: shuffled([w.gloss, ...wrong], random), answer: w.gloss });
    }
  }
  return out;
}

export interface PlacementResult {
  /** Tỉ lệ đúng theo từng cấp (0–1); cấp không có câu thì vắng. */
  byLevel: Record<number, number>;
  /** Cấp nên bắt đầu học. */
  startLevel: number;
}

/**
 * Chấm bài xếp lớp: `answers[i]` là nghĩa đã chọn cho câu i (null = "Chưa biết"). Cấp nên bắt đầu là cấp ĐẦU TIÊN chưa đạt `PLACEMENT_PASS_RATIO`
 * (người học nắm các cấp dưới nó); nắm hết mọi cấp đã hỏi thì bắt đầu ở cấp cao nhất đã hỏi.
 */
export function scorePlacement(questions: PlacementQuestion[], answers: (string | null)[]): PlacementResult {
  const stat: Record<number, { right: number; total: number }> = {};
  questions.forEach((q, i) => {
    const s = (stat[q.level] ??= { right: 0, total: 0 });
    s.total++;
    if (answers[i] === q.answer) s.right++;
  });
  const asked = Object.keys(stat).map(Number).sort((a, b) => a - b);
  const byLevel = Object.fromEntries(asked.map((l) => [l, stat[l].right / stat[l].total]));
  const firstWeak = asked.find((l) => byLevel[l] < PLACEMENT_PASS_RATIO);
  return { byLevel, startLevel: firstWeak ?? asked.at(-1) ?? 1 };
}
