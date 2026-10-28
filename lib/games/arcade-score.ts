import type { RoundResult } from "@/lib/practice/submit-score";
import { MAX_ITEMS_PER_ROUND } from "@/lib/practice/scoring";

const PER_ITEM_CAP = 150;

/**
 * Đưa kết quả một lượt game giải trí (không chia theo "câu") về khuôn của bảng điểm: số mục 1–20, đúng không vượt tổng, điểm không vượt trần 150 mỗi mục.
 * Điểm thật của game thường cao hơn trần nên bị cắt: bảng xếp hạng chung chỉ để vui, trần này giữ các chế độ ngang hàng nhau.
 */
export function arcadeRound(points: number, correct: number, attempts: number, durationSec: number): RoundResult {
  const total = Math.min(MAX_ITEMS_PER_ROUND, Math.max(1, Math.round(attempts)));
  return { points: Math.min(total * PER_ITEM_CAP, Math.max(0, Math.round(points))), correct: Math.min(total, Math.max(0, Math.round(correct))), total, durationSec: Math.max(total * 3, Math.round(durationSec)) };
}
