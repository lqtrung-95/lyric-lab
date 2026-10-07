import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { itemKey } from "@/lib/user-state/learner-state";
import type { WordStat } from "./word-stats";

const TARGET = 0.8;

export interface Comprehension {
  /** Phần trăm từ (tính theo số lần xuất hiện) mà người dùng được xem là đã hiểu, 0–100. */
  percent: number;
  /** Số từ cốt lõi cần học thêm để chạm 80%; 0 khi đã đạt; null khi học hết các từ cốt lõi vẫn chưa tới 80%. */
  wordsTo80: number | null;
  /** Phần trăm sẽ đạt nếu học hết các từ cốt lõi còn lại. */
  percentIfAllLearned: number;
  /** Số từ cốt lõi còn lại (chưa biết, chưa được xem là dưới level). */
  toLearn: number;
}

/**
 * Ước tính độ "hiểu được" của một bài. Một từ chữ Hán được xem là ĐÃ HIỂU khi: nó là từ cốt lõi đã đánh dấu "đã biết", hoặc cấp HSK của nó
 * thấp hơn level người dùng (level N nghĩa là đã biết HSK 1 đến N−1, đúng như danh sách ở màn xem trước ẩn các mục dưới level). Mọi từ khác
 * (cấp HSK bằng hoặc cao hơn level, ngoài HSK, không tra được) là chưa hiểu. Người mới ở HSK 1 vì thế bắt đầu gần 0%. Tính theo số lần
 * xuất hiện; là ước tính, không phải bài kiểm tra. Trả null khi bài không có chữ Hán. Số từ cần học chỉ xét các từ cốt lõi vì đó là những
 * từ người dùng thấy và bấm được ở màn xem trước.
 */
export function computeComprehension(
  words: WordStat[],
  items: PreviewItem[],
  opts: { userLevel: number; known: ReadonlySet<string> },
): Comprehension | null {
  const keyById = new Map(items.filter((i) => i.type === "vocab").map((i) => [i.id, itemKey(i)]));
  const total = words.reduce((sum, w) => sum + w.count, 0);
  if (total === 0) return null;

  let understood = 0;
  const learnable: number[] = [];
  for (const w of words) {
    const key = w.itemId ? keyById.get(w.itemId) : undefined;
    if ((key !== undefined && opts.known.has(key)) || (w.level !== null && w.level < opts.userLevel)) understood += w.count;
    else if (key !== undefined) learnable.push(w.count);
  }
  learnable.sort((a, b) => b - a);

  const percent = Math.round((understood / total) * 100);
  const percentIfAllLearned = Math.round(((understood + learnable.reduce((s, n) => s + n, 0)) / total) * 100);
  let wordsTo80: number | null = 0;
  let acc = understood;
  while (acc / total < TARGET) {
    if (wordsTo80 >= learnable.length) { wordsTo80 = null; break; }
    acc += learnable[wordsTo80++];
  }
  return { percent, wordsTo80, percentIfAllLearned, toLearn: learnable.length };
}
