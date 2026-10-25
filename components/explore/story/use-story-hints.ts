"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "songhanzi-story-hints";
export interface Hints { pinyin: boolean; vi: boolean }

/** Gợi ý khi đọc hội thoại: hiện pinyin và/hoặc nghĩa tiếng Việt. Mặc định bật cả hai (người mới); ai muốn thử thách thì tắt đi. Nhớ lựa chọn. */
export function useStoryHints() {
  const [hints, setHints] = useState<Hints>({ pinyin: true, vi: true });
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY);
      // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) { const d = JSON.parse(raw) as Partial<Hints>; setHints({ pinyin: d.pinyin !== false, vi: d.vi !== false }); }
    } catch { /* dùng mặc định */ }
  }, []);
  const toggle = useCallback((k: keyof Hints) => setHints((h) => {
    const next = { ...h, [k]: !h[k] };
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* không lưu được */ }
    return next;
  }), []);
  return { hints, toggle };
}
