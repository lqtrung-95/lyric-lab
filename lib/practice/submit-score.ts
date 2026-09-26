import { track } from "@/lib/analytics/track";
import type { PracticeMode } from "./scoring";

export interface RoundResult {
  points: number;
  correct: number;
  total: number;
  durationSec: number;
}

/**
 * Gửi điểm một lượt chơi lên bảng xếp hạng. Chạy nền và bỏ qua mọi lỗi (mất mạng, chưa có phiên, quá giới hạn):
 * điểm chỉ là phần thưởng phụ, không được làm gián đoạn việc học.
 */
export async function submitRoundScore(mode: PracticeMode, result: RoundResult): Promise<boolean> {
  track("practice_round_done", { mode });
  try {
    const res = await fetch("/api/practice/score", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, ...result, points: Math.round(result.points), durationSec: Math.max(0, Math.round(result.durationSec)) }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
