"use client";

import { useEffect, useRef, useState } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import type { PracticeMode } from "@/lib/practice/scoring";
import { roundDurationSec, wordGamePoints } from "@/lib/practice/round-timer";
import { submitRoundScore } from "@/lib/practice/submit-score";

interface Args { mode: Extract<PracticeMode, "truth" | "truthduo" | "order" | "reflex" | "fiveword" | "roleplay" | "daily" | "duel">; done: boolean; correct: number; total: number; duo?: boolean; /** Điểm tính sẵn (các bài Nói phản xạ chấm theo mức, không phải 100 mỗi câu đúng). */ points?: number }

/**
 * Ghi điểm XP một lần khi người chơi làm xong lượt (có ít nhất một câu đúng): điểm 100 mỗi câu đúng, chơi cùng bạn nhân 1,5; thời lượng đo từ lúc vào trang.
 * Lỗi mạng, chưa có phiên hay chưa chạy migration chế độ mới đều bị bỏ qua (điểm chỉ là phần thưởng phụ). Trả `saved` = đã ghi được điểm để hiện lời báo.
 */
export function useWordGameScore({ mode, done, correct, total, duo = false, points }: Args): { saved: boolean } {
  const start = useRef(0);
  const sent = useRef(false);
  const [saved, setSaved] = useState(false);
  useEffect(() => { start.current = Date.now(); }, []);
  useEffect(() => {
    if (!done || sent.current || correct <= 0) return;
    sent.current = true;
    void submitRoundScore(mode, { points: points ?? wordGamePoints(correct, duo), correct, total, durationSec: roundDurationSec(start.current, Date.now(), total) })
      .then((ok) => { if (ok) { setSaved(true); refreshGameSummary(); } });
  }, [done, correct, total, mode, duo, points]);
  return { saved };
}
