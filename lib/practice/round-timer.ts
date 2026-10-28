/** Giây còn lại của một vòng có giới hạn thời gian (làm tròn lên, không âm). `startMs` và `nowMs` là mốc thời gian tính bằng mili giây. */
export function secondsLeft(startMs: number, nowMs: number, limitSec: number): number {
  return Math.max(0, Math.ceil(limitSec - (nowMs - startMs) / 1000));
}

/** Thời gian chơi thật (giây, làm tròn) của cả lượt, nhưng không ít hơn `minPerItem` giây mỗi câu: máy chủ loại lượt nhanh bất thường, nên người chơi nhanh thật vẫn được ghi điểm. */
export function roundDurationSec(startMs: number, endMs: number, items: number, minPerItem = 3): number {
  return Math.max(items * minPerItem, Math.round((endMs - startMs) / 1000));
}

/** Điểm một lượt các trò từ vựng: 100 mỗi câu đúng (dưới trần 150 mỗi câu của máy chủ); chơi cùng bạn nhân 1,5 (`coopPoints`). */
export const wordGamePoints = (correct: number, duo = false): number => (duo ? Math.round(correct * 100 * 1.5) : correct * 100);
