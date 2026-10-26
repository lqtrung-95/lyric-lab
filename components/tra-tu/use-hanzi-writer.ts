"use client";

import type HanziWriter from "hanzi-writer";
import { useEffect, useState } from "react";

export const WRITER_SIZE = 260;

const cssVar = (name: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;

/** Màu nét theo giao diện sáng/tối hiện tại (hanzi-writer chỉ hiểu hex/rgb; token của app là hex). */
function themeColors() {
  return {
    strokeColor: cssVar("--on-surface", "#1d1c15"), outlineColor: cssVar("--outline-variant", "#d8c3b0"),
    drawingColor: cssVar("--primary", "#944a00"), highlightColor: cssVar("--tertiary", "#006497"), radicalColor: cssVar("--secondary", "#3b6931"),
  };
}

// Dữ liệu nét đi qua route của app (không dùng CDN): xem /api/dictionary/strokes/[char].
type CharLoader = NonNullable<NonNullable<Parameters<typeof HanziWriter.create>[2]>["charDataLoader"]>;
const loadChar: CharLoader = (char, onLoad, onError) => {
  fetch(`/api/dictionary/strokes/${encodeURIComponent(char)}`).then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status))))).then(onLoad, onError);
};

export interface WriterState { writer: HanziWriter | null; strokeCount: number | null; hasRadical: boolean; failed: boolean }

/**
 * Tạo/hủy một HanziWriter gắn vào `target` cho chữ `char` (thư viện nạp động để không nằm trong gói đầu của trang). Tạo lại khi đổi chữ hoặc đổi giao diện sáng/tối
 * (màu nét đọc lúc tạo). Khi hủy, dọn sạch SVG và dừng hoạt hình.
 */
export function useHanziWriter(target: React.RefObject<HTMLDivElement | null>, char: string): WriterState {
  const [state, setState] = useState<WriterState>({ writer: null, strokeCount: null, hasRadical: false, failed: false });
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () => setDark(document.documentElement.classList.contains("dark"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => mo.disconnect();
  }, []);

  useEffect(() => {
    const el = target.current;
    if (!el) return;
    let cancelled = false;
    let created: HanziWriter | null = null;
    // Chạy khi đổi chữ/giao diện: xóa trạng thái cũ ngay để giao diện không hiện dữ liệu của chữ trước.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ writer: null, strokeCount: null, hasRadical: false, failed: false });
    void import("hanzi-writer").then(({ default: Writer }) => {
      if (cancelled) return;
      el.replaceChildren();
      created = Writer.create(el, char, {
        width: WRITER_SIZE, height: WRITER_SIZE, padding: 12, showOutline: true, showCharacter: true, charDataLoader: loadChar,
        strokeAnimationSpeed: 1, delayBetweenStrokes: 250, showHintAfterMisses: 3, highlightOnComplete: true, leniency: 1.2, ...themeColors(),
        onLoadCharDataSuccess: (data) => { if (!cancelled) setState({ writer: created, strokeCount: data.strokes.length, hasRadical: data.radStrokes != null && data.radStrokes.length > 0, failed: false }); },
        onLoadCharDataError: () => { if (!cancelled) setState({ writer: null, strokeCount: null, hasRadical: false, failed: true }); },
      });
    });
    return () => { cancelled = true; created?.cancelQuiz(); created?.pauseAnimation(); el.replaceChildren(); };
  }, [target, char, dark]);

  return state;
}
