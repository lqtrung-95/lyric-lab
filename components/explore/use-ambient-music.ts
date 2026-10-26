"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Mood } from "@/lib/explore/ambient-music";
import { isChineseAudioBusy } from "@/lib/speech/play-chinese";
import { startAmbientMusic, type AmbientMusic } from "./ambient-engine";

export const MUSIC_KEY = "songhanzi-explore-music";

/**
 * Nhạc nền của cảnh: mặc định TẮT (người dùng bật thì được nhớ cho lần sau). Bắt đầu phát ở lần chạm/nhấn phím đầu tiên trong trang (trình duyệt chặn tự phát),
 * hạ nhỏ khi có giọng đọc tiếng Trung, dừng khi tab bị ẩn và khi rời cảnh.
 */
export function useAmbientMusic(mood: Mood) {
  const [enabled, setEnabled] = useState(false);
  const engine = useRef<AmbientMusic | null>(null);

  useEffect(() => {
    try {
      // Đọc kho lưu của trình duyệt sau khi mount (server không có localStorage) nên cần setState trong effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(MUSIC_KEY) === "on") setEnabled(true);
    } catch { /* dùng mặc định */ }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const begin = () => {
      if (cancelled || engine.current) return;
      engine.current = startAmbientMusic(mood);
    };
    const gestures = ["pointerdown", "keydown"] as const;
    const onGesture = () => { begin(); gestures.forEach((g) => window.removeEventListener(g, onGesture)); };
    if (typeof navigator !== "undefined" && navigator.userActivation?.hasBeenActive) begin();
    else gestures.forEach((g) => window.addEventListener(g, onGesture));
    const onVisibility = () => engine.current?.setPaused(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    const duck = setInterval(() => engine.current?.setDucked(isChineseAudioBusy()), 400);
    return () => {
      cancelled = true;
      gestures.forEach((g) => window.removeEventListener(g, onGesture));
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(duck);
      engine.current?.stop();
      engine.current = null;
    };
  }, [enabled, mood]);

  const toggle = useCallback(() => {
    setEnabled((on) => {
      try { window.localStorage.setItem(MUSIC_KEY, on ? "off" : "on"); } catch { /* không lưu được: chỉ đổi trong phiên này */ }
      return !on;
    });
  }, []);

  return { enabled, toggle };
}
