import { isSingleHan } from "@/lib/tra-tu/han-char";

/** Số từ mỗi lượt tập viết và độ dài tối đa của từ (từ dài thì nhiều chữ, mỏi tay). */
export const WRITE_SESSION_SIZE = 6;
export const WRITE_MAX_CHARS = 3;

export interface WriteCardLike { item_key: string; kind: string; term: string; pinyin: string | null; meaning: string }
export interface WriteTarget { key: string; term: string; chars: string[]; pinyin: string | null; meaning: string }

/** Thống kê tập viết lưu ở thiết bị này, theo từ: số lần viết xong, số sao tốt nhất, lần cuối (ms). */
export type WriteStats = Record<string, { n: number; best: 1 | 2 | 3; last: number }>;
export const emptyWriteStats: WriteStats = {};

export function parseWriteStats(raw: unknown): WriteStats {
  if (!raw || typeof raw !== "object") return emptyWriteStats;
  const out: WriteStats = {};
  for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
    const r = v as { n?: unknown; best?: unknown; last?: unknown } | null;
    if (r && typeof r.n === "number" && (r.best === 1 || r.best === 2 || r.best === 3) && typeof r.last === "number") out[k] = { n: r.n, best: r.best, last: r.last };
  }
  return out;
}

export function recordWrite(stats: WriteStats, key: string, stars: 1 | 2 | 3, now: number): WriteStats {
  const cur = stats[key];
  return { ...stats, [key]: { n: (cur?.n ?? 0) + 1, best: Math.max(cur?.best ?? 0, stars) as 1 | 2 | 3, last: now } };
}

/**
 * Chọn từ để tập viết từ thẻ đã lưu: từ vựng chỉ gồm chữ Hán (1–3 chữ). Ưu tiên từ chưa viết lần nào, rồi từ lâu chưa viết / sao thấp;
 * `rand` (0–1) chỉ để xáo thứ tự khi hòa nên kiểm thử được.
 */
export function pickWriteTargets(cards: readonly WriteCardLike[], stats: WriteStats, size = WRITE_SESSION_SIZE, rand: () => number = Math.random): WriteTarget[] {
  const seen = new Set<string>();
  const pool: WriteTarget[] = [];
  for (const c of cards) {
    const chars = [...c.term];
    if (c.kind !== "vocab" || chars.length === 0 || chars.length > WRITE_MAX_CHARS || !chars.every(isSingleHan) || seen.has(c.term)) continue;
    seen.add(c.term);
    pool.push({ key: c.item_key, term: c.term, chars, pinyin: c.pinyin, meaning: c.meaning });
  }
  // Chưa viết (0) trước, rồi sao thấp trước, rồi viết cách đây lâu nhất; xáo ngẫu nhiên chỉ phá thế hòa.
  const key = (t: WriteTarget): [number, number, number] => { const s = stats[t.key]; return s ? [1, s.best, s.last] : [0, 0, 0]; };
  return pool.map((t) => ({ t, k: key(t), r: rand() })).sort((a, b) => a.k[0] - b.k[0] || a.k[1] - b.k[1] || a.k[2] - b.k[2] || a.r - b.r).slice(0, size).map((x) => x.t);
}
