"use client";

import { useEffect, useRef, useState } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { saveSongProgress } from "@/lib/user-data/song-progress-repo";

const SAVE_DELAY_MS = 5000;

/**
 * Theo dõi tiến độ nghe theo câu đang hát: ghi vị trí (dồn 5 giây một lần) và đánh dấu hoàn thành khi tới câu cuối.
 * Trả `completed` để giao diện mời xem tổng kết.
 */
export function useSongProgress(videoId: string, lines: AnalyzedLine[], currentIndex: number) {
  const [completed, setCompleted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const lastIndex = lines.length - 1;

  useEffect(() => {
    if (currentIndex < 0) return;
    const position = lines[currentIndex]?.start ?? 0;
    if (currentIndex >= lastIndex && lastIndex > 0) {
      clearTimeout(timer.current);
      void saveSongProgress(videoId, position, true);
      // Đặt sau khi ghi để mọi trạng thái đổi trong effect đi qua một lần cập nhật.
      queueMicrotask(() => setCompleted(true));
      return;
    }
    clearTimeout(timer.current);
    timer.current = setTimeout(() => void saveSongProgress(videoId, position, false), SAVE_DELAY_MS);
    return () => clearTimeout(timer.current);
  }, [videoId, lines, currentIndex, lastIndex]);

  return { completed };
}
