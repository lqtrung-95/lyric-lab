"use client";

import { useCallback, useEffect, useState } from "react";

const KEY = "songhanzi-story-hints";
export interface Hints { pinyin: boolean; vi: boolean }

/**
 * Gợi ý khi đọc hội thoại: hiện pinyin và/hoặc nghĩa tiếng Việt. Mặc định bật cả hai (người mới); ai muốn thử thách thì tắt đi. Nhớ lựa chọn.
 * Vụ đọc hiểu (`readingFirst`) có kho lưu riêng và mặc định tắt cả hai để người chơi tự đọc trước.
 */
export function useStoryHints(readingFirst = false) {
  const key = readingFirst ? `${KEY}:reading` : KEY;
  const [hints, setHints] = useState<Hints>({ pinyin: !readingFirst, vi: !readingFirst });
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      // Đọc kho lưu sau khi mount (server không có localStorage) nên cần setState trong effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) { const d = JSON.parse(raw) as Partial<Hints>; setHints({ pinyin: d.pinyin ?? !readingFirst, vi: d.vi ?? !readingFirst }); }
    } catch { /* dùng mặc định */ }
  }, [key, readingFirst]);
  const toggle = useCallback((k: keyof Hints) => setHints((h) => {
    const next = { ...h, [k]: !h[k] };
    try { window.localStorage.setItem(key, JSON.stringify(next)); } catch { /* không lưu được */ }
    return next;
  }), [key]);
  return { hints, toggle };
}
