"use client";

import { useSyncExternalStore } from "react";

const STEP_MS = 15_000;
const subscribe = (onChange: () => void) => {
  const id = setInterval(onChange, STEP_MS);
  return () => clearInterval(id);
};

/** Giờ hiện tại (ms), làm tròn xuống mỗi 15 giây để vẽ lại thưa. 0 ở lần vẽ phía máy chủ/chưa gắn vào trình duyệt: nơi dùng coi 0 là "chưa biết giờ". */
export function useNow(): number {
  return useSyncExternalStore(subscribe, () => Math.floor(Date.now() / STEP_MS) * STEP_MS, () => 0);
}
