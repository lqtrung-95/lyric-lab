"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "songhanzi-hsk-known-v1";
const EMPTY: ReadonlySet<string> = new Set();
let current: ReadonlySet<string> = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as unknown) : [];
    if (Array.isArray(list)) current = new Set(list.filter((x): x is string => typeof x === "string"));
  } catch { /* dùng danh sách trống */ }
}
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = (): ReadonlySet<string> => { load(); return current; };

/**
 * Các từ HSK người dùng đánh dấu "đã biết", lưu trong trình duyệt (không cần tài khoản). Dùng chung một kho cho mọi cấp và mọi bảng đang mở.
 */
export function useKnownWords() {
  const known = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
  const toggle = useCallback((word: string) => {
    const next = new Set(current);
    if (next.has(word)) next.delete(word); else next.add(word);
    current = next;
    try { window.localStorage.setItem(KEY, JSON.stringify([...next])); } catch { /* không lưu được: chỉ giữ trong phiên */ }
    listeners.forEach((l) => l());
  }, []);
  return { known, toggle };
}
