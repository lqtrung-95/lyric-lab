import { GRAMMAR_PATTERNS } from "./grammar-patterns";
import { plain, segments, type GrammarPattern } from "./grammar-types";

export type Drill =
  | { kind: "order"; patternId: string; prompt: string; tokens: string[]; answer: string[]; explain: string }
  | { kind: "fill"; patternId: string; prompt: string; before: string; after: string; options: string[]; answer: string; explain: string }
  | { kind: "choose"; patternId: string; prompt: string; options: string[]; answer: string; explain: string };

type Rng = () => number;

function shuffle<T>(a: readonly T[], rng: Rng): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

const PUNCT = /[，。！？、,.!?]/g;
const bare = (s: string) => s.replace(PUNCT, "");
const pick = <T,>(a: readonly T[], rng: Rng): T => a[Math.floor(rng() * a.length)];

/** Bài xếp từ: xáo các từ của một câu ví dụ, người học xếp lại đúng trật tự. */
export function orderDrill(p: GrammarPattern, rng: Rng): Drill | null {
  const ok = p.examples.filter((e) => segments(e.zh).length >= 3);
  if (ok.length === 0) return null;
  const ex = pick(ok, rng);
  const answer = segments(ex.zh);
  let tokens = shuffle(answer, rng);
  // Tránh xáo ra đúng thứ tự gốc.
  if (tokens.join("") === answer.join("") && tokens.length > 1) tokens = [...tokens.slice(1), tokens[0]];
  return { kind: "order", patternId: p.id, prompt: ex.vi, tokens, answer, explain: `${p.pattern}: ${p.explain}` };
}

/** Bài điền chỗ trống: che từ khoá của mẫu trong một câu ví dụ, nhiễu lấy từ từ khoá của các mẫu cùng cấp. */
export function fillDrill(p: GrammarPattern, rng: Rng, all: readonly GrammarPattern[] = GRAMMAR_PATTERNS): Drill | null {
  const keys = new Set(p.key);
  const candidates = p.examples.flatMap((ex) => {
    const segs = segments(ex.zh);
    return segs.flatMap((s, i) => (keys.has(bare(s)) ? [{ ex, segs, i }] : []));
  });
  if (candidates.length === 0) return null;
  const { ex, segs, i } = pick(candidates, rng);
  const answer = bare(segs[i]);
  const trailing = segs[i].slice(answer.length);
  const pool = [...new Set(all.filter((x) => x.level === p.level && x.id !== p.id).flatMap((x) => x.key))].filter((k) => k !== answer && !keys.has(k));
  const options = shuffle([answer, ...shuffle(pool, rng).slice(0, 3)], rng);
  if (options.length < 2) return null;
  return {
    kind: "fill", patternId: p.id, prompt: ex.vi,
    before: segs.slice(0, i).join(""), after: trailing + segs.slice(i + 1).join(""),
    options, answer, explain: `${p.pattern}: ${p.explain}`,
  };
}

/** Bài chọn câu đúng: một câu sai thường gặp đặt cạnh câu đã sửa. */
export function chooseDrill(p: GrammarPattern, rng: Rng): Drill | null {
  if (p.mistakes.length === 0) return null;
  const m = pick(p.mistakes, rng);
  return { kind: "choose", patternId: p.id, prompt: "Câu nào đúng ngữ pháp?", options: shuffle([m.wrong, m.right], rng), answer: m.right, explain: m.why };
}

/** Bài tập cho một danh sách mẫu: mỗi mẫu cho đủ loại có thể, xáo trộn, lấy `count` bài đầu (xen kẽ các mẫu). */
export function buildDrills(patterns: readonly GrammarPattern[], count: number, rng: Rng = Math.random, all: readonly GrammarPattern[] = GRAMMAR_PATTERNS): Drill[] {
  const drills = patterns.flatMap((p) => [orderDrill(p, rng), fillDrill(p, rng, all), chooseDrill(p, rng)].filter((d): d is Drill => d !== null));
  const mixed = shuffle(drills, rng);
  // Mỗi mẫu tối đa 2 bài liên tiếp trong bài thi nhiều mẫu: bốc lần lượt để đủ đa dạng.
  const seen = new Map<string, number>();
  const first: Drill[] = [], rest: Drill[] = [];
  for (const d of mixed) {
    const n = (seen.get(d.patternId) ?? 0) + 1;
    seen.set(d.patternId, n);
    (n === 1 ? first : rest).push(d);
  }
  return [...first, ...rest].slice(0, count);
}

export const isCorrect = (d: Drill, response: string[] | string): boolean =>
  d.kind === "order" ? Array.isArray(response) && response.join("") === d.answer.join("") : response === d.answer;

export const answerText = (d: Drill): string => (d.kind === "order" ? plain(d.answer.join("")) : d.answer);
