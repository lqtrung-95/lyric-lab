import { ENTRIES, type RadicalEntry } from "./radicals";

export type RadicalDrill =
  | { kind: "meaning"; num: number; prompt: string; shown: string; options: string[]; answer: string; explain: string }
  | { kind: "reverse"; num: number; prompt: string; shown: string; options: string[]; answer: string; explain: string }
  | { kind: "which"; num: number; prompt: string; shown: string; options: string[]; answer: string; explain: string }
  | { kind: "contains"; num: number; prompt: string; shown: string; options: string[]; answer: string; explain: string };

type Rng = () => number;

function shuffle<T>(a: readonly T[], rng: Rng): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}
const pick = <T,>(a: readonly T[], rng: Rng): T => a[Math.floor(rng() * a.length)];

/** Cách hiện một bộ ở đáp án: chữ gốc và biến thể ("人 亻"). */
export const radicalLabel = (e: RadicalEntry): string => [e.char, ...e.variants.filter((v) => /\p{Script=Han}/u.test(v))].join(" ");
const meaningLabel = (e: RadicalEntry): string => `Bộ ${e.name}: ${e.meaning}`;

/** Bộ gây nhầm: ưu tiên cùng số nét và cùng chủ đề (nhìn hao hao, dễ lẫn), rồi bù từ các bộ khác. Không trùng bộ đích, không trùng nhau về nhãn. */
function distractors(target: RadicalEntry, pool: readonly RadicalEntry[], label: (e: RadicalEntry) => string, rng: Rng, n = 3): RadicalEntry[] {
  const near = shuffle(pool.filter((e) => e.num !== target.num && (e.strokes === target.strokes || e.topic === target.topic)), rng);
  const far = shuffle(pool.filter((e) => e.num !== target.num), rng);
  const out: RadicalEntry[] = [];
  const seen = new Set([label(target)]);
  for (const e of [...near, ...far]) {
    if (out.length >= n) break;
    if (seen.has(label(e))) continue;
    seen.add(label(e)); out.push(e);
  }
  return out;
}

export function meaningDrill(e: RadicalEntry, pool: readonly RadicalEntry[] = ENTRIES, rng: Rng = Math.random): RadicalDrill {
  const options = shuffle([e, ...distractors(e, pool, meaningLabel, rng)].map(meaningLabel), rng);
  return { kind: "meaning", num: e.num, prompt: "Bộ thủ này tên và nghĩa là gì?", shown: radicalLabel(e), options, answer: meaningLabel(e), explain: `${e.char} là bộ ${e.name} (${e.pinyin}), ${e.strokes} nét, nghĩa: ${e.meaning}.` };
}

export function reverseDrill(e: RadicalEntry, pool: readonly RadicalEntry[] = ENTRIES, rng: Rng = Math.random): RadicalDrill {
  const options = shuffle([e, ...distractors(e, pool, radicalLabel, rng)].map(radicalLabel), rng);
  return { kind: "reverse", num: e.num, prompt: "Chọn bộ thủ có nghĩa này", shown: `Bộ ${e.name}: ${e.meaning}`, options, answer: radicalLabel(e), explain: `Bộ ${e.name} viết là ${radicalLabel(e)}, ${e.strokes} nét.` };
}

/** Cần bộ có chữ ví dụ (`rich`). Hiện một chữ, hỏi bộ thủ của nó. */
export function whichDrill(e: RadicalEntry, pool: readonly RadicalEntry[] = ENTRIES, rng: Rng = Math.random): RadicalDrill | null {
  if (!e.rich || e.rich.chars.length === 0) return null;
  const ch = pick(e.rich.chars, rng);
  const options = shuffle([e, ...distractors(e, pool.filter((x) => x.rich), radicalLabel, rng)].map(radicalLabel), rng);
  return { kind: "which", num: e.num, prompt: "Bộ thủ của chữ này là gì?", shown: ch, options, answer: radicalLabel(e), explain: `${ch} thuộc bộ ${e.name} ${radicalLabel(e)} (${e.meaning}).` };
}

/** Hiện một bộ, hỏi chữ nào chứa nó; ba chữ nhiễu lấy từ chữ ví dụ của các bộ khác. */
export function containsDrill(e: RadicalEntry, pool: readonly RadicalEntry[] = ENTRIES, rng: Rng = Math.random): RadicalDrill | null {
  if (!e.rich || e.rich.chars.length === 0) return null;
  const right = pick(e.rich.chars, rng);
  const others = shuffle(pool.filter((x) => x.num !== e.num && x.rich).flatMap((x) => x.rich!.chars), rng).filter((c) => !e.rich!.chars.includes(c) && c !== e.char);
  const wrong = [...new Set(others)].slice(0, 3);
  if (wrong.length < 3) return null;
  return { kind: "contains", num: e.num, prompt: `Chữ nào chứa bộ ${e.name}?`, shown: radicalLabel(e), options: shuffle([right, ...wrong], rng), answer: right, explain: `${right} có bộ ${e.name} ${radicalLabel(e)} (${e.meaning}).` };
}

/** Bộ bài `count` câu từ các bộ trong `entries`: mỗi bộ cho đủ loại có thể, xáo trộn, mỗi bộ xuất hiện càng đều càng tốt. */
export function buildRadicalDrills(entries: readonly RadicalEntry[], count: number, rng: Rng = Math.random, pool: readonly RadicalEntry[] = ENTRIES): RadicalDrill[] {
  const all = entries.flatMap((e) => [meaningDrill(e, pool, rng), reverseDrill(e, pool, rng), whichDrill(e, pool, rng), containsDrill(e, pool, rng)].filter((d): d is RadicalDrill => d !== null));
  const seen = new Map<number, number>();
  const first: RadicalDrill[] = [], rest: RadicalDrill[] = [];
  for (const d of shuffle(all, rng)) {
    const n = (seen.get(d.num) ?? 0) + 1; seen.set(d.num, n);
    (n === 1 ? first : rest).push(d);
  }
  return [...first, ...rest].slice(0, count);
}
