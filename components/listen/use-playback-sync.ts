"use client";

import { useEffect, useState } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { findCurrentLineIndex, shouldLoopBack } from "@/lib/listen/find-current-line";
import type { PlayerController } from "@/components/player/use-youtube-player";

const POLL_MS = 100;

/**
 * Đồng bộ lời với video: cứ 100 ms đọc `getCurrentTime()` và cập nhật chỉ số câu đang hát (LS-02) cùng trạng thái phát.
 * Khi đang lặp một câu (`loopIndex`) và phát tới hết câu thì quay về đầu câu (LS-08).
 * `currentIndex` chỉ đổi khi sang câu khác nên các dòng lời không vẽ lại mỗi 100 ms.
 */
export function usePlaybackSync(controller: PlayerController | null, lines: AnalyzedLine[], loopIndex: number | null) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!controller) return;
    const timer = setInterval(() => {
      const t = controller.getCurrentTime();
      const isPlaying = controller.isPlaying();
      setPlaying(isPlaying);
      const loopLine = loopIndex !== null ? lines[loopIndex] : undefined;
      if (loopLine && isPlaying && shouldLoopBack(t, loopLine)) {
        controller.seekTo(loopLine.start);
        setCurrentIndex(loopIndex!);
        return;
      }
      setCurrentIndex(findCurrentLineIndex(lines, t));
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [controller, lines, loopIndex]);

  return { currentIndex, playing };
}
