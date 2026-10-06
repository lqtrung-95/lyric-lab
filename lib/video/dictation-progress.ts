import type { DictationMode } from "./dictation";

export const dictationKey = (videoId: string) => `lyric-lab-dictation:${videoId}`;

/** Tiến độ chép chính tả của một video, lưu trong trình duyệt: chế độ gõ và điểm (0..1) lần làm gần nhất của từng dòng (theo `idx`). */
export interface DictationProgress {
  mode: DictationMode;
  scores: Record<number, number>;
}

export const emptyDictationProgress: DictationProgress = { mode: "pinyin", scores: {} };

export function parseDictationProgress(raw: string | null): DictationProgress {
  if (!raw) return emptyDictationProgress;
  try {
    const d = JSON.parse(raw) as Partial<DictationProgress>;
    const scores: Record<number, number> = {};
    for (const [k, v] of Object.entries(d.scores && typeof d.scores === "object" ? d.scores : {})) {
      if (/^\d+$/.test(k) && typeof v === "number" && v >= 0 && v <= 1) scores[Number(k)] = v;
    }
    return { mode: d.mode === "hanzi" ? "hanzi" : "pinyin", scores };
  } catch {
    return emptyDictationProgress;
  }
}

export const withScore = (p: DictationProgress, idx: number, score: number): DictationProgress => ({ ...p, scores: { ...p.scores, [idx]: score } });

/** Vị trí (trong danh sách dòng của bài chép) của dòng đầu tiên chưa làm; -1 nếu đã làm hết. */
export const firstUndone = (lineIdxs: number[], p: DictationProgress): number => lineIdxs.findIndex((idx) => p.scores[idx] === undefined);

export function summarizeProgress(lineIdxs: number[], p: DictationProgress): { done: number; total: number; average: number } {
  const done = lineIdxs.filter((idx) => p.scores[idx] !== undefined);
  const sum = done.reduce((a, idx) => a + p.scores[idx], 0);
  return { done: done.length, total: lineIdxs.length, average: done.length === 0 ? 0 : sum / done.length };
}
