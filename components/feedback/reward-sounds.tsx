"use client";

import { useEffect, useRef } from "react";
import { useGameSummary } from "@/components/layout/use-game-summary";
import { playSfx } from "@/lib/feedback/sfx";
import type { GameSummary } from "@/lib/game/game-types";
import { rewardSoundFor } from "@/lib/game/reward-sound";

/**
 * Phát tiếng thưởng khi tóm tắt game (XP, cấp, chuỗi ngày, nhiệm vụ, huy hiệu) tăng, ở MỌI màn hình: gắn một lần trong khung chính nên không phải thêm tiếng ở từng nơi cộng điểm.
 * Lần tải đầu không phát (chưa có gì để so). Theo công tắc âm thanh hiệu ứng trong Cài đặt như các tiếng đúng/sai.
 */
export function RewardSounds() {
  const summary = useGameSummary();
  const prev = useRef<GameSummary | null>(null);
  useEffect(() => {
    if (!summary) return;
    const kind = rewardSoundFor(prev.current, summary);
    prev.current = summary;
    if (kind) playSfx(kind);
  }, [summary]);
  return null;
}
