"use client";

import type { Hints } from "./use-story-hints";

/** Hai nút bật/tắt gợi ý (pinyin, nghĩa tiếng Việt) dùng chung cho hội thoại và sổ vụ án. */
export function HintToggles({ hints, onToggle }: { hints: Hints; onToggle: (k: keyof Hints) => void }) {
  const cls = (on: boolean) => `min-h-11 rounded-full border-2 border-ink px-3 text-label-md font-extrabold ${on ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface-variant"}`;
  return (
    <div role="group" aria-label="Gợi ý" className="flex gap-1.5">
      <button type="button" aria-pressed={hints.pinyin} onClick={() => onToggle("pinyin")} className={cls(hints.pinyin)}>Pinyin</button>
      <button type="button" aria-pressed={hints.vi} onClick={() => onToggle("vi")} className={cls(hints.vi)}>Nghĩa</button>
    </div>
  );
}
