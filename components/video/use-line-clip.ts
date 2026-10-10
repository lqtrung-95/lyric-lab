"use client";

import { useCallback, useEffect, useRef } from "react";
import type { PlayerController } from "@/components/player/use-youtube-player";

/**
 * Phát đoạn của một dòng (từ `start` tới `end`) rồi tự dừng. Có thể phát chậm (0.75x). Dùng cho chép chính tả: người học bấm "Nghe"
 * bao nhiêu lần tùy ý. `onEnd` (nếu có) chạy khi đoạn phát hết (không chạy khi bị `stop`). Phát chỉ bắt đầu từ thao tác của người dùng (trình duyệt chặn tự phát).
 */
export function useLineClip(controller: PlayerController | null) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const stop = useCallback(() => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  }, []);

  const play = useCallback((start: number, end: number, rate: number, onEnd?: () => void) => {
    if (!controller) return;
    stop();
    controller.setRate(rate);
    controller.playRange(start, end);
    timer.current = setInterval(() => {
      if (controller.getCurrentTime() >= end) {
        controller.pause();
        stop();
        onEnd?.();
      }
    }, 100);
  }, [controller, stop]);

  useEffect(() => stop, [stop]);
  return { play, stop };
}
