"use client";

import { useCallback, useEffect, useRef } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { PlayerController } from "@/components/player/use-youtube-player";

/**
 * Nghe đúng 1 câu rồi tự dừng lại ở cuối câu — không chạy tiếp sang câu sau, không lặp. Dùng cho bước "Nghe" khi
 * luyện phát âm: nếu cứ phát tiếp như tua-tới-câu thông thường, nhạc nền trôi qua câu khác sẽ làm nội dung đang
 * luyện (vốn đã chụp lại cố định lúc mở popup) không còn khớp với câu đang vang lên.
 */
export function useListenLineOnce(controller: PlayerController | null, lines: AnalyzedLine[]) {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  return useCallback((index: number) => {
    const line = lines[index];
    if (!controller || !line) return;
    if (timerRef.current) clearInterval(timerRef.current);
    controller.seekTo(line.start);
    controller.play();
    timerRef.current = setInterval(() => {
      if (controller.getCurrentTime() < line.end) return;
      controller.pause();
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    }, 100);
  }, [controller, lines]);
}
