"use client";

import { useCallback, useSyncExternalStore } from "react";

/** Thanh bên có đang thu gọn (chỉ icon) trên màn hình rộng không; nhớ lựa chọn trong trình duyệt, mặc định mở rộng. */
const KEY = "songhanzi-sidebar-collapsed-v1";
let collapsed = false;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { collapsed = window.localStorage.getItem(KEY) === "1"; } catch { /* dùng mặc định */ }
}
const subscribe = (cb: () => void) => { listeners.add(cb); return () => { listeners.delete(cb); }; };
const getSnapshot = (): boolean => { load(); return collapsed; };

/** Dùng chung một kho cho thanh bên, thanh trên và khung nội dung để cả ba cùng đổi bề rộng. */
export function useSidebarCollapsed() {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const toggle = useCallback(() => {
    collapsed = !collapsed;
    try { window.localStorage.setItem(KEY, collapsed ? "1" : "0"); } catch { /* không lưu được */ }
    listeners.forEach((l) => l());
  }, []);
  return { collapsed: isCollapsed, toggle };
}
