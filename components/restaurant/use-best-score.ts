"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "songhanzi-restaurant-best";
const listeners = new Set<() => void>();

/** Kỷ lục lưu trong trình duyệt; null khi chưa có hoặc không đọc được localStorage. */
export function readBestScore(): number | null {
  try {
    const v = Number(localStorage.getItem(KEY));
    return Number.isFinite(v) && v > 0 ? v : null;
  } catch {
    return null;
  }
}

const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };

/**
 * Kỷ lục của game Quán ăn. Dùng `useSyncExternalStore` với snapshot máy chủ là null: HTML dựng ở server và lần vẽ đầu ở trình duyệt giống nhau
 * (không lệch hydrate), rồi giá trị thật từ localStorage hiện ra ngay sau đó.
 */
export function useBestScore(): { best: number | null; submit: (score: number) => void } {
  const best = useSyncExternalStore(subscribe, readBestScore, () => null);
  const submit = useCallback((score: number) => {
    const cur = readBestScore();
    if (cur !== null && score <= cur) return;
    try { localStorage.setItem(KEY, String(score)); } catch { /* không lưu được kỷ lục: không sao */ }
    listeners.forEach((l) => l());
  }, []);
  return { best, submit };
}
