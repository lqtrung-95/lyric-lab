"use client";

import { useArcadeHints } from "./use-arcade-hints";

const base = "min-h-11 rounded-full border px-3 text-sm font-bold";

/** Hai nút bật/tắt gợi ý Pinyin và Nghĩa (dùng chung mọi game). Game nào để lộ đáp án nếu hiện pinyin thì truyền `pinyin={false}` để chỉ còn nút Nghĩa. `dark` cho khung game nền tối. */
export function HintToggles({ pinyin = true, dark = false }: { pinyin?: boolean; dark?: boolean }) {
  const h = useArcadeHints();
  const on = dark ? "border-cyan-300 bg-cyan-300/20 text-white" : "border-ink bg-primary text-on-primary";
  const off = dark ? "border-white/25 bg-black/30 text-white/70" : "border-ink bg-surface-container-lowest text-on-surface";
  return (
    <span role="group" aria-label="Gợi ý" className="inline-flex gap-1.5" onClick={(e) => e.stopPropagation()}>
      {pinyin && <button type="button" aria-pressed={h.pinyin} onClick={() => h.set({ pinyin: !h.pinyin })} className={`${base} ${h.pinyin ? on : off}`}>Pinyin</button>}
      <button type="button" aria-pressed={h.meaning} onClick={() => h.set({ meaning: !h.meaning })} className={`${base} ${h.meaning ? on : off}`}>Nghĩa</button>
    </span>
  );
}
