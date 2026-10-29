"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

/**
 * Giá trị JSON nhỏ lưu ở localStorage, các thành phần cùng trang đồng bộ qua sự kiện `event`. Dùng cho trạng thái phụ của pet
 * (sổ từ pet đã học, chuyến phiêu lưu) chỉ có ý nghĩa trên thiết bị này. `parse` phải trả `empty` khi dữ liệu sai dạng; `empty` là hằng ở cấp module.
 * Chưa đọc xong (lần vẽ đầu phía máy chủ) thì trả `empty`.
 */
export function useLocalJson<T>(key: string, event: string, parse: (raw: unknown) => T, empty: T): [T, (next: T) => void] {
  const subscribe = useCallback((onChange: () => void) => {
    window.addEventListener("storage", onChange);
    window.addEventListener(event, onChange);
    return () => { window.removeEventListener("storage", onChange); window.removeEventListener(event, onChange); };
  }, [event]);
  const read = useCallback(() => { try { return localStorage.getItem(key); } catch { return null; } }, [key]);
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const value = useMemo(() => {
    if (!raw) return empty;
    try { return parse(JSON.parse(raw)); } catch { return empty; }
  }, [raw, parse, empty]);
  const write = useCallback((next: T) => {
    try { localStorage.setItem(key, JSON.stringify(next)); } catch { /* localStorage bị chặn: chỉ mất trạng thái phụ */ }
    window.dispatchEvent(new Event(event));
  }, [key, event]);
  return [value, write];
}
