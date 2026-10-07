import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { itemKey } from "@/lib/user-state/learner-state";

const HAN = /\p{Script=Han}/u;
const TARGET = 0.8;

export interface Comprehension {
  /** Phần trăm từ (tính theo số lần xuất hiện) mà người dùng được xem là đã hiểu, 0–100. */
  percent: number;
  /** Số từ cần học thêm (ưu tiên từ xuất hiện nhiều nhất) để chạm 80%; 0 khi đã đạt. */
  wordsTo80: number;
  /** Số từ đáng học còn lại (chưa biết, không thấp hơn level). */
  toLearn: number;
}

/**
 * Ước tính độ "hiểu được" của một bài: trong mọi từ chữ Hán của lời, từ nào thuộc mục từ vựng ĐÁNG HỌC (chưa đánh dấu đã biết và không
 * thấp hơn level của người dùng, đúng như danh sách ở màn xem trước) thì chưa hiểu; các từ còn lại (từ dễ, từ đã biết, từ phổ thông
 * không nằm trong mục từ vựng) được xem là hiểu. Đây là ước tính, không phải bài kiểm tra. Trả null khi bài không có chữ Hán.
 */
export function computeComprehension(
  lines: Pick<AnalyzedLine, "tokens">[],
  items: PreviewItem[],
  opts: { userLevel: number; known: ReadonlySet<string> },
): Comprehension | null {
  const toLearnIds = new Set(
    items
      .filter((i) => i.type === "vocab" && !opts.known.has(itemKey(i)) && !(i.level !== null && i.level < opts.userLevel))
      .map((i) => i.id),
  );
  let total = 0;
  const occurrences = new Map<string, number>();
  for (const line of lines) {
    for (const token of line.tokens) {
      if (!HAN.test(token.text)) continue;
      total++;
      if (token.itemId && toLearnIds.has(token.itemId)) occurrences.set(token.itemId, (occurrences.get(token.itemId) ?? 0) + 1);
    }
  }
  if (total === 0) return null;

  const counts = [...occurrences.values()].sort((a, b) => b - a);
  let unknown = counts.reduce((sum, n) => sum + n, 0);
  const percent = Math.round(((total - unknown) / total) * 100);

  let wordsTo80 = 0;
  while (unknown > 0 && (total - unknown) / total < TARGET && wordsTo80 < counts.length) unknown -= counts[wordsTo80++];
  return { percent, wordsTo80, toLearn: counts.length };
}
