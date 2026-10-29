import { toneVariants } from "./placement-pinyin";

/**
 * Bài xếp lớp nhiều dạng câu, thiết kế để KHÓ ĐOÁN MÒ/LOẠI TRỪ:
 * - meaning: chữ Hán → nghĩa (đáp án nhiễu cùng cấp, độ dài và kiểu ghi chú giống đáp án đúng, không loại trừ theo hình thức được).
 * - pinyin: chữ Hán → pinyin (đáp án nhiễu chỉ khác thanh điệu: người không biết thanh không loại trừ được).
 * - cloze: câu thật bỏ trống một từ → chọn chữ Hán (đáp án nhiễu cùng số chữ, hay chung một chữ với đáp án đúng).
 * - reverse: nghĩa → chọn chữ Hán (nhớ chữ, không chỉ nhận mặt chữ).
 * - listen: nghe một từ → chọn nghĩa (không có chữ để nhìn).
 * Chấm có trừ điểm khi đoán sai ("Chưa biết" không bị trừ) và dừng sớm khi hai cấp liên tiếp quá khó.
 */
export type PlacementKind = "meaning" | "pinyin" | "cloze" | "reverse" | "listen";

export interface PlacementWord {
  term: string;
  pinyin: string;
  gloss: string;
  /** Câu thật chứa từ (chỉ có ở từ được chọn làm câu hỏi, nếu kho có). */
  sentence?: { text: string; translation: string };
}

export interface PlacementQuestion {
  level: number;
  kind: PlacementKind;
  /** Từ được hỏi (chữ Hán giản thể). */
  term: string;
  pinyin: string;
  /** Đáp án đúng và các đáp án nhiễu đã xáo; luôn có thêm lựa chọn "Chưa biết" ở giao diện (không nằm trong mảng này). */
  options: string[];
  answer: string;
  /** Nghĩa tiếng Việt của từ (câu reverse hiện làm đề bài). */
  gloss: string;
  /** Câu bỏ trống (cloze): phần trước, phần sau chỗ trống và bản dịch. */
  before?: string;
  after?: string;
  translation?: string;
}

export const PLACEMENT_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export const QUESTIONS_PER_LEVEL = 6;
/** Số từ ứng viên mỗi cấp để dựng câu hỏi (dư ra để bù câu thiếu pinyin/câu thật). */
export const CANDIDATES_PER_LEVEL = 14;
/** Dạng câu của mỗi cấp, theo thứ tự ưu tiên chọn từ. */
export const KIND_PLAN: readonly PlacementKind[] = ["meaning", "pinyin", "cloze", "reverse", "listen", "meaning"];
/** Điểm ròng tối thiểu (tỉ lệ) để coi là "nắm" một cấp. */
export const PLACEMENT_PASS_RATIO = 0.6;
/** Trả lời sai trừ 1/3 điểm của một câu đúng (4 đáp án): đoán mò không có lợi, "Chưa biết" không bị trừ. */
export const WRONG_PENALTY = 1 / 3;
/** Hai cấp liên tiếp dưới ngưỡng này thì dừng bài (người học đã vượt quá trình độ, hỏi tiếp chỉ làm nản). */
export const STOP_RATIO = 0.4;
const OPTIONS = 4;
const MAX_SENTENCE_CHARS = 28;

type Random = () => number;
const shuffled = <T,>(items: readonly T[], random: Random): T[] => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const len = (s: string) => [...s].length;
const hasTag = (gloss: string) => /^\s*[(（]/.test(gloss);

/** Chọn ứng viên mỗi cấp (cùng đối tượng với kho, để chỗ gọi bổ sung pinyin/câu thật rồi đưa vào `buildPlacementQuestions`). */
export function pickCandidates(pools: Record<number, PlacementWord[]>, random: Random = Math.random): Record<number, PlacementWord[]> {
  return Object.fromEntries(PLACEMENT_LEVELS.map((l) => [l, shuffled(pools[l] ?? [], random).slice(0, CANDIDATES_PER_LEVEL)]));
}

/** `n` đáp án nhiễu xếp theo độ "giống" đáp án đúng (điểm càng thấp càng giống); trong cùng điểm thì ngẫu nhiên. */
function closest<T>(items: readonly T[], score: (x: T) => number, key: (x: T) => string, n: number, random: Random): T[] {
  const seen = new Set<string>();
  return shuffled(items, random)
    .map((x) => ({ x, s: score(x) }))
    .sort((a, b) => a.s - b.s)
    .filter(({ x }) => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; })
    .slice(0, n)
    .map(({ x }) => x);
}

/** Nghĩa nhiễu: khác nghĩa đúng, độ dài gần và cùng kiểu ghi chú "(trợ từ)…" với nghĩa đúng. */
function glossDistractors(pool: readonly PlacementWord[], w: PlacementWord, random: Random): string[] | null {
  const others = pool.filter((x) => x.term !== w.term && x.gloss !== w.gloss);
  const picked = closest(others, (x) => Math.abs(len(x.gloss) - len(w.gloss)) + (hasTag(x.gloss) === hasTag(w.gloss) ? 0 : 100), (x) => x.gloss, OPTIONS - 1, random);
  return picked.length === OPTIONS - 1 ? picked.map((x) => x.gloss) : null;
}

/** Chữ Hán nhiễu: cùng số chữ với đáp án đúng, ưu tiên từ chung một chữ (dễ nhầm hơn), không loại trừ được theo độ dài. */
function termDistractors(pool: readonly PlacementWord[], w: PlacementWord, random: Random): string[] | null {
  const chars = new Set([...w.term]);
  const others = pool.filter((x) => x.term !== w.term);
  const picked = closest(others, (x) => Math.abs(len(x.term) - len(w.term)) * 10 + ([...x.term].some((c) => chars.has(c)) ? 0 : 1), (x) => x.term, OPTIONS - 1, random);
  return picked.length === OPTIONS - 1 ? picked.map((x) => x.term) : null;
}

function clozeParts(w: PlacementWord): { before: string; after: string } | null {
  const s = w.sentence;
  if (!s || len(s.text) > MAX_SENTENCE_CHARS) return null;
  const at = s.text.indexOf(w.term);
  return at < 0 ? null : { before: s.text.slice(0, at), after: s.text.slice(at + w.term.length) };
}

function build(kind: PlacementKind, level: number, w: PlacementWord, pool: readonly PlacementWord[], random: Random): PlacementQuestion | null {
  const base = { level, kind, term: w.term, pinyin: w.pinyin, gloss: w.gloss };
  switch (kind) {
    case "meaning":
    case "listen": {
      const wrong = glossDistractors(pool, w, random);
      return wrong ? { ...base, options: shuffled([w.gloss, ...wrong], random), answer: w.gloss } : null;
    }
    case "pinyin": {
      if (!w.pinyin) return null;
      const wrong = toneVariants(w.pinyin, OPTIONS - 1, random);
      return wrong.length === OPTIONS - 1 ? { ...base, options: shuffled([w.pinyin, ...wrong], random), answer: w.pinyin } : null;
    }
    case "reverse": {
      const wrong = termDistractors(pool, w, random);
      return wrong ? { ...base, options: shuffled([w.term, ...wrong], random), answer: w.term } : null;
    }
    case "cloze": {
      const parts = clozeParts(w);
      const wrong = parts ? termDistractors(pool, w, random) : null;
      return parts && wrong && w.sentence ? { ...base, ...parts, translation: w.sentence.translation, options: shuffled([w.term, ...wrong], random), answer: w.term } : null;
    }
  }
}

/**
 * Dựng bài xếp lớp: mỗi cấp `QUESTIONS_PER_LEVEL` câu theo `KIND_PLAN`, xếp từ cấp thấp lên cao. Từ làm đề lấy từ `candidates` (đã bổ sung pinyin/câu thật),
 * đáp án nhiễu lấy từ `pools` (cả kho của cấp). Dạng nào không dựng được cho từ nào (thiếu pinyin, thiếu câu thật…) thì thử từ khác, rồi rơi về dạng `meaning`.
 * Cấp không đủ từ thì bỏ qua cấp đó. `random` truyền vào để test cố định.
 */
export function buildPlacementQuestions(pools: Record<number, PlacementWord[]>, candidates: Record<number, PlacementWord[]>, random: Random = Math.random): PlacementQuestion[] {
  const out: PlacementQuestion[] = [];
  for (const level of PLACEMENT_LEVELS) {
    const pool = pools[level] ?? [];
    if (pool.length < OPTIONS + 1) continue;
    const free = shuffled(candidates[level] ?? [], random);
    const made: PlacementQuestion[] = [];
    for (const kind of KIND_PLAN.slice(0, QUESTIONS_PER_LEVEL)) {
      for (const kinds of [[kind], ["meaning" as const]]) {
        const idx = free.findIndex((w) => kinds.some((k) => build(k, level, w, pool, () => 0.5)));
        if (idx < 0) continue;
        const w = free.splice(idx, 1)[0];
        const q = kinds.map((k) => build(k, level, w, pool, random)).find((x): x is PlacementQuestion => x !== null);
        if (q) { made.push(q); break; }
      }
    }
    out.push(...made);
  }
  return out;
}

export interface PlacementResult {
  /** Điểm ròng theo từng cấp (0–1, đã trừ đoán sai); cấp không có câu thì vắng. */
  byLevel: Record<number, number>;
  /** Điểm ròng theo dạng câu (0–1); dạng không có câu thì vắng. */
  byKind: Partial<Record<PlacementKind, number>>;
  /** Số câu trả lời sai (không tính "Chưa biết"). */
  wrong: number;
  /** Cấp nên bắt đầu học. */
  startLevel: number;
}

const points = (q: PlacementQuestion, a: string | null | undefined): number => (a == null ? 0 : a === q.answer ? 1 : -WRONG_PENALTY);

/**
 * Chấm bài xếp lớp: `answers[i]` là đáp án đã chọn cho câu i (null/thiếu = "Chưa biết", 0 điểm; sai trừ `WRONG_PENALTY`). Điểm mỗi cấp = tổng điểm / số câu (tối thiểu 0).
 * Cấp nên bắt đầu là cấp ĐẦU TIÊN chưa đạt `PLACEMENT_PASS_RATIO` (người học nắm các cấp dưới nó); nắm hết mọi cấp đã hỏi thì bắt đầu ở cấp cao nhất đã hỏi.
 */
export function scorePlacement(questions: PlacementQuestion[], answers: (string | null)[]): PlacementResult {
  const lv: Record<number, { sum: number; total: number }> = {};
  const kd: Partial<Record<PlacementKind, { sum: number; total: number }>> = {};
  let wrong = 0;
  questions.forEach((q, i) => {
    const p = points(q, answers[i]);
    if (p < 0) wrong++;
    const l = (lv[q.level] ??= { sum: 0, total: 0 });
    l.sum += p; l.total++;
    const k = (kd[q.kind] ??= { sum: 0, total: 0 });
    k.sum += p; k.total++;
  });
  const asked = Object.keys(lv).map(Number).sort((a, b) => a - b);
  const byLevel = Object.fromEntries(asked.map((l) => [l, Math.max(0, lv[l].sum) / lv[l].total]));
  const byKind = Object.fromEntries(Object.entries(kd).map(([k, v]) => [k, Math.max(0, v!.sum) / v!.total])) as Partial<Record<PlacementKind, number>>;
  const firstWeak = asked.find((l) => byLevel[l] < PLACEMENT_PASS_RATIO);
  return { byLevel, byKind, wrong, startLevel: firstWeak ?? asked.at(-1) ?? 1 };
}

/** Dừng sớm: hai cấp liên tiếp gần nhất (theo thứ tự đã hỏi) đều dưới `STOP_RATIO`. */
export function shouldStopEarly(byLevel: Record<number, number>): boolean {
  const ratios = Object.keys(byLevel).map(Number).sort((a, b) => a - b).map((l) => byLevel[l]);
  return ratios.length >= 2 && ratios.at(-1)! < STOP_RATIO && ratios.at(-2)! < STOP_RATIO;
}
