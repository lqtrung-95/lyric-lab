"use client";

import { useEffect, useRef } from "react";

/** Vòng lặp khung hình: gọi `onFrame(dt giây)` mỗi lần vẽ khi `active`. `dt` bị chặn ở 0,05 giây để tab bị ẩn rồi mở lại không làm từ rơi vọt xuống đáy. */
export function useGameLoop(onFrame: (dt: number) => void, active: boolean): void {
  const frame = useRef(onFrame);
  useEffect(() => { frame.current = onFrame; });
  useEffect(() => {
    if (!active) return;
    let raf = 0, last = performance.now();
    const tick = (now: number) => {
      frame.current(Math.min(0.05, (now - last) / 1000));
      last = now;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
