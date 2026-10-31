export interface DrillCard { item_key: string; kind: string; term: string; pinyin: string | null; meaning: string; due?: string; lapses?: number }
export type SavedDrillKind = "meaning" | "term" | "pinyin";
export interface SavedDrill { cardKey: string; term: string; kind: SavedDrillKind; prompt: string; shown: string; options: string[]; answer: string }

type Rng = () => number;
function shuffle<T>(a: readonly T[], rng: Rng): T[] {
  const out = [...a];
  for (let i = out.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); [out[i], out[j]] = [out[j], out[i]]; }
  return out;
}

/** Thẻ dùng được cho bài: từ vựng có nghĩa (nghĩa phải khác nhau để không có hai đáp án đúng). */
export const usableCards = (cards: readonly DrillCard[]): DrillCard[] => cards.filter((c) => c.kind === "vocab" && c.term && c.meaning.trim());

const PROMPT: Record<SavedDrillKind, string> = { meaning: "Từ này nghĩa là gì?", term: "Chọn từ có nghĩa này", pinyin: "Từ này đọc là gì?" };

/** Giá trị của thẻ ở một kiểu bài (null nếu thẻ thiếu dữ liệu cho kiểu đó). */
function field(c: DrillCard, kind: SavedDrillKind): string | null {
  if (kind === "meaning") return c.meaning.trim();
  if (kind === "term") return c.term;
  return c.pinyin?.trim() || null;
}
const shownOf = (c: DrillCard, kind: SavedDrillKind): string => (kind === "term" ? c.meaning.trim() : c.term);

/** Một câu cho thẻ `c` ở kiểu `kind` với ba đáp án nhiễu từ các thẻ khác; null nếu không đủ nhiễu khác nhau. */
export function drillFor(c: DrillCard, kind: SavedDrillKind, pool: readonly DrillCard[], rng: Rng): SavedDrill | null {
  const answer = field(c, kind);
  if (!answer) return null;
  const seen = new Set([answer]);
  const wrong: string[] = [];
  for (const o of shuffle(pool.filter((x) => x.item_key !== c.item_key), rng)) {
    const v = field(o, kind);
    // Đáp án nhiễu không được trùng đáp án đúng, và với bài pinyin chữ khác phải đọc khác.
    if (!v || seen.has(v)) continue;
    seen.add(v); wrong.push(v);
    if (wrong.length === 3) break;
  }
  if (wrong.length < 3) return null;
  return { cardKey: c.item_key, term: c.term, kind, prompt: PROMPT[kind], shown: shownOf(c, kind), options: shuffle([answer, ...wrong], rng), answer };
}

/**
 * Bộ `count` câu từ thẻ đã lưu: ưu tiên thẻ đến hạn ôn hoặc hay quên, mỗi thẻ một câu, xoay ba kiểu (từ → nghĩa, nghĩa → từ, từ → pinyin).
 * Cần ít nhất 4 thẻ dùng được; thiếu thì trả rỗng.
 */
export function buildSavedDrills(cards: readonly DrillCard[], count: number, rng: Rng = Math.random, now: number = Date.now()): SavedDrill[] {
  const pool = usableCards(cards);
  if (pool.length < 4) return [];
  const priority = (c: DrillCard) => ((c.lapses ?? 0) > 0 || (c.due !== undefined && Date.parse(c.due) <= now) ? 0 : 1);
  const ordered = shuffle(pool, rng).sort((a, b) => priority(a) - priority(b));
  const kinds: SavedDrillKind[] = ["meaning", "term", "pinyin"];
  const out: SavedDrill[] = [];
  for (const c of ordered) {
    if (out.length >= count) break;
    const start = out.length % kinds.length;
    const d = [0, 1, 2].map((i) => drillFor(c, kinds[(start + i) % 3], pool, rng)).find((x) => x !== null);
    if (d) out.push(d);
  }
  return out;
}
