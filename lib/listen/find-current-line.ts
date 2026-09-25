import type { AnalyzedLine } from "@/lib/analysis/analysis-types";

// Sau khi câu cuối kết thúc quá lâu (phần outro) thì không còn câu nào được coi là đang hát.
const OUTRO_GRACE_SEC = 3;

/**
 * Chỉ số câu đang hát tại thời điểm `t` (giây): câu cuối cùng có start ≤ t. Giữ câu trước trong khoảng lặng giữa hai câu
 * để lời không nhấp nháy. Trả -1 nếu chưa tới câu đầu hoặc đã qua hết bài. Tìm nhị phân vì được gọi mỗi 100 ms.
 */
export function findCurrentLineIndex(lines: Pick<AnalyzedLine, "start" | "end">[], t: number): number {
  if (lines.length === 0 || t < lines[0].start) return -1;
  let lo = 0;
  let hi = lines.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (lines[mid].start <= t) lo = mid;
    else hi = mid - 1;
  }
  const last = lines[lines.length - 1];
  return lo === lines.length - 1 && t > last.end + OUTRO_GRACE_SEC ? -1 : lo;
}

/** Đang lặp câu: cần quay về đầu câu khi phát tới (gần) hết câu. */
export function shouldLoopBack(t: number, line: Pick<AnalyzedLine, "end">): boolean {
  return t >= line.end - 0.05;
}
