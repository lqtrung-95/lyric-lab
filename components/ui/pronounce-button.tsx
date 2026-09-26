"use client";

import { Icon } from "@/components/ui/icon";
import { playChinese } from "@/lib/speech/play-chinese";

/** Nút loa đọc chữ Hán: giọng AI tự nhiên từ server, rơi về giọng hệ thống khi cần (xem `playChinese`). */
export function PronounceButton({ text, className = "" }: { text: string; className?: string }) {
  return (
    <button
      type="button"
      onClick={() => void playChinese(text)}
      aria-label={`Nghe phát âm ${text}`}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-surface-container-high ${className}`}
    >
      <Icon name="volume_up" size={22} />
    </button>
  );
}
