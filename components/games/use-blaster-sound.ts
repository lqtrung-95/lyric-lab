"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import type { BlasterState } from "@/lib/games/blaster-engine";

/** Phát âm thanh theo thay đổi của state Bắn chữ (so với khung trước): tia laser mỗi phím đúng, nổ khi bắn trúng, thịch khi mất mạng, buzz khi gõ sai, fanfare lên cấp, nhạc tàn khi thua. */
export function useBlasterSound(s: BlasterState, active: boolean): void {
  const prev = useRef({ kills: 0, lives: s.lives, typed: 0, level: 1, combo: 0, over: false });
  useEffect(() => {
    const p = prev.current;
    if (active) {
      if (s.kills > p.kills) sfx.explosion(s.combo);
      else if (s.typed.length > p.typed) sfx.laser(s.typed.length);
      else if (p.combo > 0 && s.combo === 0 && s.lives === p.lives) sfx.buzz();
      if (s.lives < p.lives && !s.over) sfx.miss();
      if (s.level > p.level) sfx.levelUp();
      if (s.over && !p.over) sfx.gameOver();
    }
    prev.current = { kills: s.kills, lives: s.lives, typed: s.typed.length, level: s.level, combo: s.combo, over: s.over };
  }, [s, active]);
}
