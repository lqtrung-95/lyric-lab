"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Khóa mới (v2) để mọi người bắt đầu với gợi ý TẮT, luyện đọc trước; lựa chọn cũ (mặc định bật) không còn áp dụng. */
const KEY = "songhanzi-story-hints-v2";
export interface Hints { pinyin: boolean; vi: boolean }

const OFF: Hints = { pinyin: false, vi: false };
let current: Hints = OFF;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) { const d = JSON.parse(raw) as Partial<Hints>; current = { pinyin: d.pinyin === true, vi: d.vi === true }; }
  } catch { /* dùng mặc định */ }
}
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = (): Hints => { load(); return current; };

/**
 * Gợi ý khi đọc trong chế độ phá án: hiện pinyin và/hoặc nghĩa tiếng Việt. Mặc định TẮT cả hai để người chơi luyện đọc; bấm nút để bật khi cần.
 * Dùng chung một kho cho cả thanh trên cảnh, bong bóng thoại và sổ vụ án (bật ở đâu thì mọi nơi đổi theo), nhớ lựa chọn trong trình duyệt.
 */
export function useStoryHints() {
  const hints = useSyncExternalStore(subscribe, getSnapshot, () => OFF);
  const toggle = useCallback((k: keyof Hints) => {
    current = { ...current, [k]: !current[k] };
    try { window.localStorage.setItem(KEY, JSON.stringify(current)); } catch { /* không lưu được */ }
    listeners.forEach((l) => l());
  }, []);
  return { hints, toggle };
}
