// Điểm và thắng thua ở phòng thi đấu. Công thức điểm phải trùng với hàm SQL `room_answer_points` (nguồn chấm thật);
// bản TypeScript này dùng cho giao diện/test và có test tích hợp đối chiếu hai bản.
export const ROOM_QUESTION_MS = 15_000;
export const ROOM_BASE_POINTS = 100;
export const ROOM_SPEED_BONUS_MAX = 30;

/** Đúng: 100 điểm + thưởng tốc độ 0–30 giảm tuyến tính trong thời gian của câu. Sai hoặc hết giờ: 0. */
export function roomAnswerPoints(correct: boolean, elapsedMs: number): number {
  if (!correct) return 0;
  // Tính bằng số nguyên (làm tròn nửa lên) để khớp hàm SQL ở mọi giá trị, kể cả những mốc đúng .5 mà số thực có thể làm lệch.
  const elapsed = Math.min(ROOM_QUESTION_MS, Math.max(0, Math.floor(elapsedMs)));
  const bonus = Math.floor((ROOM_SPEED_BONUS_MAX * (ROOM_QUESTION_MS - elapsed) * 2 + ROOM_QUESTION_MS) / (2 * ROOM_QUESTION_MS));
  return ROOM_BASE_POINTS + bonus;
}

export interface PlayerTotals {
  correct: number;
  points: number;
}

/**
 * Người thắng ván: nhiều câu đúng hơn thắng; bằng số câu đúng thì so tổng điểm (thưởng tốc độ chỉ có tác dụng ở đây);
 * vẫn bằng thì hòa. Không so thẳng tổng điểm vì 9 câu đúng cộng thưởng tối đa vẫn hơn 10 câu đúng không có thưởng.
 */
export function decideWinner(a: PlayerTotals, b: PlayerTotals): "a" | "b" | "draw" {
  if (a.correct !== b.correct) return a.correct > b.correct ? "a" : "b";
  if (a.points !== b.points) return a.points > b.points ? "a" : "b";
  return "draw";
}
