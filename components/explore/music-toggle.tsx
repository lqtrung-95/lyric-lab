"use client";

import { Icon } from "@/components/ui/icon";

/** Nút bật/tắt nhạc nền của cảnh (nhớ lựa chọn). */
export function MusicToggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={enabled}
      onClick={onToggle}
      className={`inline-flex min-h-11 items-center gap-1.5 rounded-full border-2 border-ink px-3 text-label-md font-extrabold ${enabled ? "bg-primary-container text-on-primary-container" : "bg-surface-container-lowest text-on-surface-variant"}`}
    >
      <Icon name="music_note" size={18} filled={enabled} />
      Nhạc nền: {enabled ? "Bật" : "Tắt"}
    </button>
  );
}
