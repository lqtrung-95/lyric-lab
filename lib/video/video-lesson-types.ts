/** Một dòng của bản chép video (đã chia từ, có pinyin, có bản dịch nếu ghép được). Lưu trong `video_lessons.lines`. */
export interface LessonLine {
  idx: number;
  /** giây */
  start: number;
  end: number;
  text: string;
  /** Pinyin ghép theo từng từ (cùng định dạng với `AnalyzedLine.pinyin`: mỗi chữ Hán một âm tiết, ngăn bằng dấu cách). */
  pinyin: string;
  /** Bản dịch tiếng Việt của dòng; null khi không ghép được (admin rà lại). */
  translation: string | null;
  tokens: { text: string }[];
}

export type LessonStatus = "draft" | "listed" | "hidden";
export type TranslationSource = "youtube" | "ai" | "none";
