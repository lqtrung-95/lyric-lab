import type { GrammarPattern } from "./grammar-types";

export const GRAMMAR_STATS_KEY = "lyric-lab-grammar-stats";
export const GRAMMAR_STATS_EVENT = "lyric-lab-grammar-stats-changed";

export interface PatternStat { right: number; wrong: number; last: number }
export type GrammarStats = Record<string, PatternStat>;
export const EMPTY_STATS: GrammarStats = {};

const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) && v >= 0 ? Math.min(Math.floor(v), 9999) : 0);

export function parseGrammarStats(raw: unknown): GrammarStats {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return EMPTY_STATS;
  const out: GrammarStats = {};
  for (const [id, v] of Object.entries(raw as Record<string, unknown>)) {
    if (!/^[a-z0-9-]{1,40}$/.test(id) || !v || typeof v !== "object") continue;
    const s = v as Record<string, unknown>;
    out[id] = { right: num(s.right), wrong: num(s.wrong), last: num(s.last) };
  }
  return out;
}

export function recordAnswer(stats: GrammarStats, patternId: string, correct: boolean, now: number): GrammarStats {
  const cur = stats[patternId] ?? { right: 0, wrong: 0, last: 0 };
  return { ...stats, [patternId]: { right: cur.right + (correct ? 1 : 0), wrong: cur.wrong + (correct ? 0 : 1), last: now } };
}

const accuracy = (s: PatternStat) => (s.right + s.wrong === 0 ? 1 : s.right / (s.right + s.wrong));

/** Mẫu hay sai: ít nhất 2 lần trả lời, ít nhất 1 lần sai, độ chính xác dưới 65%; sai nhiều nhất lên đầu. */
export function weakPatternIds(stats: GrammarStats, limit = 5): string[] {
  return Object.entries(stats)
    .filter(([, s]) => s.right + s.wrong >= 2 && s.wrong >= 1 && accuracy(s) < 0.65)
    .sort((a, b) => accuracy(a[1]) - accuracy(b[1]) || b[1].wrong - a[1].wrong)
    .slice(0, limit)
    .map(([id]) => id);
}

/** Mẫu đã nắm: trả đúng ít nhất 3 lần và chính xác từ 70%. */
export const isMastered = (s: PatternStat | undefined): boolean => !!s && s.right >= 3 && accuracy(s) >= 0.7;

export function levelProgress(stats: GrammarStats, patterns: readonly GrammarPattern[]): { mastered: number; tried: number; total: number } {
  return {
    mastered: patterns.filter((p) => isMastered(stats[p.id])).length,
    tried: patterns.filter((p) => (stats[p.id]?.right ?? 0) + (stats[p.id]?.wrong ?? 0) > 0).length,
    total: patterns.length,
  };
}
