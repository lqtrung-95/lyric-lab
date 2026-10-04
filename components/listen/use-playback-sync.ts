"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { findCurrentLineIndex, shouldLoopBack } from "@/lib/listen/find-current-line";
import { defaultRepeatConfig, type RepeatConfig } from "@/lib/listen/repeat-config";
import type { PlayerController } from "@/components/player/use-youtube-player";

const POLL_MS = 100;

/**
 * Đồng bộ lời với video: cứ 100 ms đọc `getCurrentTime()` và cập nhật chỉ số câu đang hát (LS-02) cùng trạng thái phát.
 * Khi đang lặp một câu (`loopIndex`) và phát tới hết câu thì quay về đầu câu (LS-08). `repeat.times` giới hạn số lần
 * lặp (null = vô hạn tới khi người dùng tắt); hết lượt thì gọi `onRepeatsExhausted` để màn Nghe tự tắt "Lặp câu" và
 * để bài chạy tiếp bình thường. `repeat.delaySec` tạm dừng phát giữa mỗi lần lặp, cho người học kịp nhắc lại.
 * `currentIndex` chỉ đổi khi sang câu khác nên các dòng lời không vẽ lại mỗi 100 ms.
 */
export function usePlaybackSync(
  controller: PlayerController | null,
  lines: AnalyzedLine[],
  loopIndex: number | null,
  repeat: RepeatConfig = defaultRepeatConfig,
  onRepeatsExhausted?: () => void,
) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [playing, setPlaying] = useState(false);
  const repeatsLeftRef = useRef(repeat.times);
  // Mốc thời gian (ms, Date.now()) để tiếp tục phát sau khoảng nghỉ giữa hai lần lặp; null = không đang nghỉ.
  const resumeAtRef = useRef<number | null>(null);
  const cancelPendingResume = useCallback(() => {
    resumeAtRef.current = null;
  }, []);

  // Đổi câu đang lặp hay đổi số lần lặp (mở bảng cấu hình mới) thì tính lại từ đầu.
  useEffect(() => {
    repeatsLeftRef.current = repeat.times;
    resumeAtRef.current = null;
  }, [loopIndex, repeat.times]);

  useEffect(() => {
    if (!controller) return;
    const timer = setInterval(() => {
      if (resumeAtRef.current !== null) {
        if (Date.now() < resumeAtRef.current) {
          setPlaying(false);
          return;
        }
        resumeAtRef.current = null;
        controller.play();
      }
      const t = controller.getCurrentTime();
      const isPlaying = controller.isPlaying();
      setPlaying(isPlaying);
      const loopLine = loopIndex !== null ? lines[loopIndex] : undefined;
      if (loopLine && isPlaying && shouldLoopBack(t, loopLine)) {
        if (repeatsLeftRef.current !== null) {
          repeatsLeftRef.current -= 1;
          if (repeatsLeftRef.current <= 0) {
            // Hết lượt lặp: không quay đầu câu nữa, để bài chạy tiếp tự nhiên.
            onRepeatsExhausted?.();
            setCurrentIndex(findCurrentLineIndex(lines, t));
            return;
          }
        }
        controller.seekTo(loopLine.start);
        setCurrentIndex(loopIndex!);
        if (repeat.delaySec > 0) {
          controller.pause();
          resumeAtRef.current = Date.now() + repeat.delaySec * 1000;
        }
        return;
      }
      setCurrentIndex(findCurrentLineIndex(lines, t));
    }, POLL_MS);
    return () => clearInterval(timer);
  }, [controller, lines, loopIndex, repeat.delaySec, onRepeatsExhausted]);

  return { currentIndex, playing, cancelPendingResume };
}
