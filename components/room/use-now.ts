"use client";

import { useSyncExternalStore } from "react";

/** Giờ máy làm tròn theo `intervalMs`, tự cập nhật: dùng cho đồng hồ đếm ngược (render lại mỗi nhịp). Trên server trả 0. */
export function useNow(intervalMs = 1000): number {
  return useSyncExternalStore(
    (onChange) => {
      const id = setInterval(onChange, intervalMs);
      return () => clearInterval(id);
    },
    () => Math.floor(Date.now() / intervalMs) * intervalMs,
    () => 0,
  );
}

/** "mm:ss" từ số mili giây còn lại (không âm). */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}
