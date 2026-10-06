import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { LessonLine } from "./video-lesson-types";

/**
 * Chuyển dòng của video sang kiểu `AnalyzedLine` để dùng lại danh sách lời, thẻ tra từ và API giải nghĩa của màn Nghe.
 * Video không có mục từ vựng/ngữ pháp được chọn trước nên token không mang `itemId`.
 */
export function lessonLinesToAnalyzed(lines: LessonLine[]): AnalyzedLine[] {
  return lines.map((l) => ({
    index: l.idx,
    text: l.text,
    start: l.start,
    end: l.end,
    pinyin: l.pinyin,
    translation: l.translation ?? undefined,
    tokens: l.tokens.map((t) => ({ text: t.text })),
  }));
}
