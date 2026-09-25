import type { PreviewItem } from "@/lib/analysis/analysis-types";

// Trạng thái học của người dùng: bản làm việc trong trình duyệt (đồng bộ lên Supabase ở `lib/user-data`). Toàn bộ hàm là thuần để test được.
export const LEARNER_STATE_KEY = "lyric-lab-learner-state";
export const DEFAULT_LEVEL = 3;
export const MAX_LEVEL = 7; // 7 = nhóm 7–9 của HSK 3.0

export interface SavedItem {
  key: string;
  videoId: string;
  type: PreviewItem["type"];
  term: string;
  /** Dòng lời chứa mục này và thời điểm bắt đầu, để flashcard nghe lại đúng đoạn. */
  lineIndex: number;
  start: number;
  savedAt: number;
  /** Ảnh chụp để dựng thẻ ôn mà không cần tải lại bài (thẻ cũ lưu trước khi có tài khoản thì thiếu `meaning`). */
  reading?: string;
  sinoViet?: string;
  level?: number | null;
  meaning?: string;
}

/** Phần ảnh chụp của một mục, lấy từ PreviewItem hoặc từ kết quả tra từ. */
export type CardSnapshot = Pick<SavedItem, "reading" | "sinoViet" | "level" | "meaning">;

export interface LearnerState {
  level: number;
  /** Khóa các mục "Đã biết": ẩn ở mọi bài. */
  known: string[];
  saved: SavedItem[];
}

export const initialLearnerState: LearnerState = { level: DEFAULT_LEVEL, known: [], saved: [] };

/** Khóa ổn định của một mục, dùng chung cho mọi bài (từ giống nhau ở bài khác cũng tính là đã biết). */
export const itemKey = (item: Pick<PreviewItem, "type" | "term">) => `${item.type}:${item.term}`;

export const setLevel = (s: LearnerState, level: number): LearnerState => ({
  ...s,
  level: Math.min(MAX_LEVEL, Math.max(1, Math.round(level))),
});

export const markKnown = (s: LearnerState, key: string): LearnerState =>
  s.known.includes(key) ? s : { ...s, known: [...s.known, key] };

export const unmarkKnown = (s: LearnerState, key: string): LearnerState => ({ ...s, known: s.known.filter((k) => k !== key) });

/** Bật/tắt "Lưu": lưu lần đầu, bấm lại thì bỏ lưu. */
export function toggleSaved(s: LearnerState, item: SavedItem): LearnerState {
  return s.saved.some((x) => x.key === item.key)
    ? { ...s, saved: s.saved.filter((x) => x.key !== item.key) }
    : { ...s, saved: [...s.saved, item] };
}

export function parseLearnerState(raw: string | null): LearnerState {
  if (!raw) return initialLearnerState;
  try {
    const d = JSON.parse(raw) as Partial<LearnerState>;
    return {
      level: typeof d.level === "number" ? setLevel(initialLearnerState, d.level).level : DEFAULT_LEVEL,
      known: Array.isArray(d.known) ? d.known.filter((k): k is string => typeof k === "string") : [],
      saved: Array.isArray(d.saved)
        ? d.saved.filter((x): x is SavedItem => typeof x?.key === "string" && typeof x?.videoId === "string" && typeof x?.start === "number")
        : [],
    };
  } catch {
    return initialLearnerState;
  }
}
