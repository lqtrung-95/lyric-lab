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
  /**
   * Ai đặt bản dịch hiện tại, khi không phải bản gốc của phụ đề: "ai" = AI dịch lại sau khi người học báo sai; "admin" = quản trị viên đã sửa hoặc
   * khôi phục. Cả hai đều khóa dòng khỏi việc AI dịch lại tiếp: báo tiếp chỉ ghi nhận cho quản trị (tránh vòng lặp và người phá bản đã xác nhận).
   */
  translationBy?: "ai" | "admin";
}

export type LessonStatus = "draft" | "listed" | "hidden";
export type TranslationSource = "youtube" | "ai" | "none";
