"use client";

import { useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { speakChinese, speechSupported } from "@/lib/speech/speak-chinese";

const noop = () => () => {};

/** Nút loa đọc chữ Hán bằng giọng tiếng Phổ thông của trình duyệt. Ẩn khi trình duyệt không hỗ trợ đọc. */
export function PronounceButton({ text, className = "" }: { text: string; className?: string }) {
  const supported = useSyncExternalStore(noop, speechSupported, () => false);
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => speakChinese(text)}
      aria-label={`Nghe phát âm ${text}`}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-surface-container-high ${className}`}
    >
      <Icon name="volume_up" size={22} />
    </button>
  );
}
