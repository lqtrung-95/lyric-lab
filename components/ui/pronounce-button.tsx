"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { Spinner } from "@/components/ui/spinner";
import { playChinese } from "@/lib/speech/play-chinese";

/** Nút loa đọc chữ Hán: giọng AI tự nhiên từ server, rơi về giọng hệ thống khi cần (xem `playChinese`). */
export function PronounceButton({ text, className = "" }: { text: string; className?: string }) {
  const [busy, setBusy] = useState(false);
  async function play() {
    setBusy(true);
    try {
      await playChinese(text);
    } finally {
      setBusy(false);
    }
  }
  return (
    <button
      type="button"
      onClick={() => void play()}
      aria-busy={busy}
      aria-label={`Nghe phát âm ${text}`}
      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container text-primary transition-colors hover:bg-surface-container-high ${className}`}
    >
      {busy ? <Spinner size={18} /> : <Icon name="volume_up" size={22} />}
    </button>
  );
}
