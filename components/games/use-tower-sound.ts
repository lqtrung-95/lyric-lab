"use client";

import { useEffect, useRef } from "react";
import { sfx } from "@/lib/games/arcade-sfx";
import type { TowerState } from "@/lib/games/tower-engine";

/** Âm thanh của Pet thủ thành theo thay đổi state: bắn trúng (cao dần theo combo, đủ 5 combo thì pet reo), chọn sai thì buzz + pet buồn, quái vào nhà thì thịch, sang đợt mới thì fanfare, thua thì nhạc tàn. */
export function useTowerSound(s: TowerState, species: string, active: boolean): void {
  const prev = useRef({ kills: 0, wrong: 0, lives: s.lives, wave: 1, supers: 0, over: false });
  useEffect(() => {
    const p = prev.current;
    if (active) {
      if (s.supers > p.supers) sfx.petCheer();
      else if (s.kills > p.kills) { sfx.explosion(s.combo); sfx.petChirp(species); }
      if (s.wrong > p.wrong) { sfx.buzz(); sfx.petSad(); }
      if (s.lives < p.lives && !s.over) sfx.miss();
      if (s.wave > p.wave) sfx.levelUp();
      if (s.over && !p.over) sfx.gameOver();
    }
    prev.current = { kills: s.kills, wrong: s.wrong, lives: s.lives, wave: s.wave, supers: s.supers, over: s.over };
  }, [s, species, active]);
}
