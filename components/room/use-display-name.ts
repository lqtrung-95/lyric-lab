"use client";

import { useCallback, useSyncExternalStore } from "react";
import { parseDisplayName } from "@/lib/rooms/display-name";

const KEY = "lyric-lab-room-name";
const EVENT = "lyric-lab-room-name-changed";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(EVENT, onChange);
  };
}
const read = (): string => {
  try {
    return localStorage.getItem(KEY) ?? "";
  } catch {
    return "";
  }
};

/** Tên hiển thị trong phòng thi đấu, nhớ trong trình duyệt để lần sau khỏi nhập lại. `valid` là tên đã qua kiểm tra (null nếu chưa hợp lệ). */
export function useDisplayName() {
  const name = useSyncExternalStore(subscribe, read, () => "");
  const setName = useCallback((value: string) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      // localStorage bị chặn: tên chỉ nhớ tới khi tải lại trang.
    }
    window.dispatchEvent(new Event(EVENT));
  }, []);
  return { name, setName, valid: parseDisplayName(name) };
}
