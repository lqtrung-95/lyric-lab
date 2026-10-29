"use client";

import { useCallback, useSyncExternalStore } from "react";

const KEY = "lyric-lab-pet-mini";
const EVENT = "lyric-lab-pet-mini";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => { window.removeEventListener("storage", onChange); window.removeEventListener(EVENT, onChange); };
}
const read = () => { try { return localStorage.getItem(KEY); } catch { return null; } };

/** Có hiện pet thu nhỏ ở các màn học, kết quả và bản đồ chặng không (mặc định có). Lưu trong trình duyệt. */
export function usePetMiniPref(): [boolean, (visible: boolean) => void] {
  const raw = useSyncExternalStore(subscribe, read, () => null);
  const set = useCallback((visible: boolean) => {
    try { localStorage.setItem(KEY, visible ? "on" : "off"); } catch { /* chỉ đổi trong phiên này */ }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return [raw !== "off", set];
}
