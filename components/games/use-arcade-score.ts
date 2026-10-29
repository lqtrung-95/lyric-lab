"use client";

import { useEffect, useRef, useState } from "react";
import { refreshGameSummary } from "@/components/layout/use-game-summary";
import { practiceRoundXp } from "@/lib/game/xp-rules";
import type { PracticeMode } from "@/lib/practice/scoring";
import { submitRoundScore, type RoundResult } from "@/lib/practice/submit-score";

/**
 * Ghi điểm XP một lần khi ván kết thúc (`over`). `getResult(giây đã chơi)` trả null nếu chưa có gì đáng ghi. Thời gian đo từ lúc component gắn vào, nên game đặt `key` mới cho mỗi ván.
 * Trả thêm `xp`: số XP của ván (2 XP mỗi câu đúng, khác điểm xếp hạng), chỉ có nghĩa khi `saved`.
 * Lỗi mạng, chưa có phiên hay chưa chạy migration chế độ mới đều bị bỏ qua (điểm chỉ là phần thưởng phụ).
 */
export function useArcadeScore(mode: PracticeMode, over: boolean, getResult: (durationSec: number) => RoundResult | null): { saved: boolean; xp: number } {
  const start = useRef(0);
  const sent = useRef(false);
  const get = useRef(getResult);
  const [saved, setSaved] = useState(false);
  const [xp, setXp] = useState(0);
  useEffect(() => { get.current = getResult; });
  useEffect(() => { start.current = Date.now(); }, []);
  useEffect(() => {
    if (!over || sent.current) return;
    sent.current = true;
    const r = get.current(Math.round((Date.now() - start.current) / 1000));
    if (!r || r.correct <= 0) return;
    void submitRoundScore(mode, r).then((ok) => { if (ok) { setXp(practiceRoundXp(r.correct, r.total)); setSaved(true); refreshGameSummary(); } });
  }, [over, mode]);
  return { saved, xp };
}
