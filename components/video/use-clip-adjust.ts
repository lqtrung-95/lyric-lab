"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { NO_ADJUST, isAdjusted, nudgeAdjust, type ClipAdjust } from "@/lib/video/clip-range";

type AdjustMap = Record<number, ClipAdjust>;
const key = (videoId: string) => `lyric-lab-clip-adjust:${videoId}`;

function read(videoId: string): AdjustMap {
  try {
    const raw = JSON.parse(localStorage.getItem(key(videoId)) ?? "{}") as Record<string, Partial<ClipAdjust>>;
    return Object.fromEntries(Object.entries(raw).map(([idx, a]) => [Number(idx), { start: Number(a?.start) || 0, end: Number(a?.end) || 0 }]));
  } catch {
    return {};
  }
}

/**
 * Phần người học chỉnh đoạn phát của từng câu (đầu/cuối, theo giây) khi mốc thời gian của video lệch. Lưu trong trình duyệt theo từng video, chỉ cho chính họ.
 * `nudge`/`reset` trả về giá trị mới để nơi gọi phát lại đúng đoạn vừa chỉnh (state chưa kịp cập nhật trong cùng lượt).
 */
export function useClipAdjust(videoId: string) {
  const [map, setMap] = useState<AdjustMap>({});
  const latest = useRef(map);

  // Đọc sau khi tải (tránh lệch giữa server và client).
  useEffect(() => {
    const timer = setTimeout(() => { const saved = read(videoId); latest.current = saved; setMap(saved); }, 0);
    return () => clearTimeout(timer);
  }, [videoId]);

  const commit = useCallback((idx: number, value: ClipAdjust): ClipAdjust => {
    const next = { ...latest.current };
    if (isAdjusted(value)) next[idx] = value; else delete next[idx];
    latest.current = next;
    setMap(next);
    try { localStorage.setItem(key(videoId), JSON.stringify(next)); } catch { /* không lưu được: chỉnh chỉ giữ trong phiên này */ }
    return value;
  }, [videoId]);

  const get = useCallback((idx: number): ClipAdjust => map[idx] ?? NO_ADJUST, [map]);
  const nudge = useCallback((idx: number, edge: keyof ClipAdjust, delta: number) => commit(idx, nudgeAdjust(latest.current[idx] ?? NO_ADJUST, edge, delta)), [commit]);
  const reset = useCallback((idx: number) => commit(idx, NO_ADJUST), [commit]);
  return { get, nudge, reset };
}
