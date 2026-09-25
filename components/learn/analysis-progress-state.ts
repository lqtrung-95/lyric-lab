import type { AnalysisErrorCode } from "@/lib/analysis/analysis-error-codes";

export type ProgressStep = "connecting" | "lyrics" | "analysis" | "done";

export interface ProgressState {
  step: ProgressStep;
  meta: { title: string; channelTitle: string } | null;
  error: AnalysisErrorCode | null;
}

export type ProgressAction =
  | { type: "meta"; title: string; channelTitle: string }
  | { type: "step"; step: "lyrics" | "analysis" }
  | { type: "done" }
  | { type: "error"; code: AnalysisErrorCode };

export const initialProgress: ProgressState = { step: "connecting", meta: null, error: null };

// Ba bước hiển thị (design-brief S3) và bước SSE tương ứng đang chạy.
export const PROGRESS_LABELS = ["Lấy lời bài hát", "Phân tích từ vựng", "Chuẩn bị bài học"] as const;

/** Chỉ số bước đang chạy (0–2), 3 = xong cả ba, -1 = chưa bắt đầu. */
export function activeStepIndex(step: ProgressStep): number {
  return { connecting: -1, lyrics: 0, analysis: 1, done: 3 }[step];
}

export function progressReducer(state: ProgressState, action: ProgressAction): ProgressState {
  switch (action.type) {
    case "meta":
      return { ...state, meta: { title: action.title, channelTitle: action.channelTitle } };
    case "step":
      return { ...state, step: action.step };
    case "done":
      return { ...state, step: "done" };
    case "error":
      return { ...state, error: action.code };
  }
}
