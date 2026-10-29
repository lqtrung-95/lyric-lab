"use client";

import { useEffect, useRef } from "react";
import { startChiptune } from "@/lib/games/chiptune";
import { sfx } from "@/lib/games/arcade-sfx";
import type { SquadronState } from "@/lib/games/squadron-types";

/**
 * Âm thanh của Phi đội theo thay đổi state: tiếng bắn mỗi phát, nổ khi trúng chữ đúng (cao dần theo combo), buzz khi bắn nhầm, thịch khi mất mạng, nhặt vật phẩm, lên cấp, nhạc tàn khi thua.
 * Nhạc nền chiptune chạy suốt ván và nhanh dần theo cấp.
 */
export function useSquadronSound(s: SquadronState, active: boolean): void {
  const prev = useRef({ kills: 0, wrong: 0, lives: s.lives, level: 1, fired: 0, got: 0, over: false });
  const level = useRef(1);
  useEffect(() => { level.current = s.level; });
  useEffect(() => {
    if (!active) return;
    return startChiptune(() => 112 + level.current * 6);
  }, [active]);
  useEffect(() => {
    const p = prev.current;
    if (active) {
      if (s.kills > p.kills) sfx.explosion(s.combo);
      else if (s.fired > p.fired) sfx.pew();
      if (s.wrong > p.wrong) sfx.buzz();
      if (s.lives < p.lives && !s.over) sfx.miss();
      if (s.got > p.got) sfx.power();
      if (s.level > p.level) sfx.levelUp();
      if (s.over && !p.over) sfx.gameOver();
    }
    prev.current = { kills: s.kills, wrong: s.wrong, lives: s.lives, level: s.level, fired: s.fired, got: s.got, over: s.over };
  }, [s, active]);
}
