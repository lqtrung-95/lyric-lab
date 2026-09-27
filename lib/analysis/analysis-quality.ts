import type { SongAnalysis } from "./analysis-types";

export type QualityIssue = "too_short" | "not_chinese" | "too_few_items";

const MIN_LINES = 8;
const MIN_HAN_LINE_RATIO = 0.6;
const MIN_VOCAB_ITEMS = 5;
const HAN = /\p{Script=Han}/gu;

/**
 * Kiểm tra nhanh một bản phân tích có đáng niêm yết ở tab Khám phá không: đủ dòng, phần lớn dòng là chữ Hán,
 * và chọn được đủ từ vựng. Trả các vấn đề tìm thấy (rỗng = ổn). Bài có vấn đề vẫn học được bởi người đã phân tích, chỉ không được giới thiệu cho người khác.
 */
export function assessAnalysisQuality(analysis: Pick<SongAnalysis, "lines" | "items">): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const { lines, items } = analysis;
  if (lines.length < MIN_LINES) issues.push("too_short");
  const hanLines = lines.filter((l) => (l.text.match(HAN)?.length ?? 0) >= 2).length;
  if (lines.length > 0 && hanLines / lines.length < MIN_HAN_LINE_RATIO) issues.push("not_chinese");
  if (items.filter((i) => i.type === "vocab").length < MIN_VOCAB_ITEMS) issues.push("too_few_items");
  return issues;
}
