import type { RadicalEntry } from "./radicals";

export const RADICAL_PROGRESS_KEY = "lyric-lab-radicals";
export const RADICAL_PROGRESS_EVENT = "lyric-lab-radicals-changed";

export interface RadicalStat { right: number; wrong: number; last: number }
export interface RadicalProgress { /** Số thứ tự các bộ đã đánh dấu "đã biết". */ known: number[]; stats: Record<string, RadicalStat> }
export const EMPTY_PROGRESS: RadicalProgress = { known: [], stats: {} };

const int = (v: unknown, max: number) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), max) : 0);

export function parseRadicalProgress(raw: unknown): RadicalProgress {
  if (!raw || typeof raw !== "object") return EMPTY_PROGRESS;
  const r = raw as { known?: unknown; stats?: unknown };
  const known = Array.isArray(r.known) ? [...new Set(r.known.filter((n): n is number => Number.isInteger(n) && n >= 1 && n <= 214))].sort((a, b) => a - b) : [];
  const stats: Record<string, RadicalStat> = {};
  if (r.stats && typeof r.stats === "object" && !Array.isArray(r.stats)) {
    for (const [k, v] of Object.entries(r.stats as Record<string, unknown>)) {
      const n = Number(k);
      if (!Number.isInteger(n) || n < 1 || n > 214 || !v || typeof v !== "object") continue;
      const s = v as Record<string, unknown>;
      stats[k] = { right: int(s.right, 9999), wrong: int(s.wrong, 9999), last: int(s.last, 9e15) };
    }
  }
  return { known, stats };
}

export const toggleKnown = (p: RadicalProgress, num: number): RadicalProgress =>
  ({ ...p, known: p.known.includes(num) ? p.known.filter((n) => n !== num) : [...p.known, num].sort((a, b) => a - b) });

export function recordRadicalAnswer(p: RadicalProgress, num: number, correct: boolean, now: number): RadicalProgress {
  const cur = p.stats[num] ?? { right: 0, wrong: 0, last: 0 };
  return { ...p, stats: { ...p.stats, [num]: { right: cur.right + (correct ? 1 : 0), wrong: cur.wrong + (correct ? 0 : 1), last: now } } };
}

/** Bộ hay nhầm: ít nhất 2 lượt, có sai, đúng dưới 65%; tệ nhất lên đầu. */
export function weakRadicals(p: RadicalProgress, limit = 6): number[] {
  return Object.entries(p.stats)
    .filter(([, s]) => s.right + s.wrong >= 2 && s.wrong >= 1 && s.right / (s.right + s.wrong) < 0.65)
    .sort((a, b) => a[1].right / (a[1].right + a[1].wrong) - b[1].right / (b[1].right + b[1].wrong))
    .slice(0, limit).map(([k]) => Number(k));
}

export const topicProgress = (p: RadicalProgress, entries: readonly RadicalEntry[]) => ({ known: entries.filter((e) => p.known.includes(e.num)).length, total: entries.length });

/** Gộp hai bản (thiết bị và tài khoản): hợp các bộ đã biết, lấy số lớn hơn của từng trường thống kê. */
export function mergeRadicalProgress(a: RadicalProgress, b: RadicalProgress): RadicalProgress {
  const stats: Record<string, RadicalStat> = { ...a.stats };
  for (const [k, s] of Object.entries(b.stats)) {
    const c = stats[k];
    stats[k] = c ? { right: Math.max(c.right, s.right), wrong: Math.max(c.wrong, s.wrong), last: Math.max(c.last, s.last) } : s;
  }
  return { known: [...new Set([...a.known, ...b.known])].sort((x, y) => x - y), stats };
}
