"use client";

import { useSyncExternalStore } from "react";
import { isArcadeMuted, setArcadeMuted, subscribeArcadeSound } from "@/lib/games/arcade-sfx";

/** Công tắc âm thanh chung của các game giải trí (mặc định bật; lưu trên thiết bị). Bấm cũng là thao tác người dùng để trình duyệt cho phép phát tiếng. */
export function SoundToggle({ className = "" }: { className?: string }) {
  const muted = useSyncExternalStore(subscribeArcadeSound, isArcadeMuted, () => false);
  return (
    <button type="button" aria-pressed={!muted} aria-label={muted ? "Bật âm thanh" : "Tắt âm thanh"} onClick={(e) => { e.stopPropagation(); setArcadeMuted(!muted); }} className={className}>
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
