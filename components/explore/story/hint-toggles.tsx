"use client";

import type { Hints } from "./use-story-hints";

/** Nút bật/tắt gợi ý (pinyin, nghĩa tiếng Việt) dùng chung cho hội thoại và sổ vụ án; `withVoice` thêm nút "Tự đọc" lời NPC (chỉ ở bong bóng thoại). */
export function HintToggles({ hints, onToggle, withVoice = false }: { hints: Hints; onToggle: (k: keyof Hints) => void; withVoice?: boolean }) {
  const cls = (on: boolean) => `min-h-11 rounded-full border-2 border-ink px-3 text-label-md font-extrabold ${on ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface-variant"}`;
  return (
    <div role="group" aria-label="Gợi ý" className="flex gap-1.5">
      <button type="button" aria-pressed={hints.pinyin} onClick={() => onToggle("pinyin")} className={cls(hints.pinyin)}>Pinyin</button>
      <button type="button" aria-pressed={hints.vi} onClick={() => onToggle("vi")} className={cls(hints.vi)}>Nghĩa</button>
      {withVoice && <button type="button" aria-pressed={hints.voice} onClick={() => onToggle("voice")} className={cls(hints.voice)}>Tự đọc</button>}
    </div>
  );
}
