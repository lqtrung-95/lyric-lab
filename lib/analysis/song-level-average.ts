import type { PreviewItem } from "@/lib/analysis/analysis-types";

/** Cấp HSK trung bình của từ vựng đã chọn (bỏ từ ngoài HSK); null nếu không có từ nào có cấp. Dùng để lọc "vừa sức" ở tab Khám phá. */
export function averageVocabLevel(items: Pick<PreviewItem, "type" | "level">[]): number | null {
  const levels = items.filter((i) => i.type === "vocab" && i.level !== null).map((i) => i.level as number);
  if (levels.length === 0) return null;
  return Math.round((levels.reduce((a, b) => a + b, 0) / levels.length) * 10) / 10;
}
