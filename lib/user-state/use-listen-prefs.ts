"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { LISTEN_PREFS_KEY, defaultListenPrefs, parseListenPrefs, type ListenPrefs } from "./listen-prefs";

const EVENT = "lyric-lab-listen-prefs";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
function readRaw(): string | null {
  try {
    return localStorage.getItem(LISTEN_PREFS_KEY);
  } catch {
    return null;
  }
}

/** Tùy chọn màn Nghe (pinyin, bản dịch, tốc độ) được nhớ trong localStorage (LS-03). */
export function useListenPrefs() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const prefs = useMemo(() => (raw === null ? defaultListenPrefs : parseListenPrefs(raw)), [raw]);

  const update = useCallback((patch: Partial<ListenPrefs>) => {
    const next = { ...parseListenPrefs(readRaw()), ...patch };
    try {
      localStorage.setItem(LISTEN_PREFS_KEY, JSON.stringify(next));
    } catch {
      // localStorage bị chặn: thay đổi chỉ tồn tại tới khi tải lại trang.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);

  return { prefs, update };
}
