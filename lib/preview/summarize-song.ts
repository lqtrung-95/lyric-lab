import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { itemKey, type LearnerState } from "@/lib/user-state/learner-state";

export interface SongSummary {
  savedCount: number;
  knownCount: number;
  vocabTotal: number;
  /** Từ vựng của bài mà người học đã hiểu: đánh dấu "Đã biết" hoặc dưới level hiện tại (được coi là đã biết). */
  vocabUnderstood: number;
  /** 0–100. */
  understoodPercent: number;
}

/** Tổng kết một bài (RV-03) từ danh sách mục của bài và trạng thái học hiện tại. */
export function summarizeSong(videoId: string, items: PreviewItem[], state: LearnerState): SongSummary {
  const known = new Set(state.known);
  const vocab = items.filter((i) => i.type === "vocab");
  const understood = vocab.filter((i) => known.has(itemKey(i)) || (i.level !== null && i.level < state.level));
  return {
    savedCount: state.saved.filter((s) => s.videoId === videoId).length,
    knownCount: items.filter((i) => known.has(itemKey(i))).length,
    vocabTotal: vocab.length,
    vocabUnderstood: understood.length,
    understoodPercent: vocab.length === 0 ? 0 : Math.round((understood.length / vocab.length) * 100),
  };
}
