"use client";

import { Icon } from "@/components/ui/icon";

interface ViewTogglesProps {
  showPinyin: boolean;
  showTranslation: boolean;
  onTogglePinyin: () => void;
  onToggleTranslation: () => void;
  className?: string;
}

const toggleClass = (on: boolean) =>
  `inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-label-md transition-colors ${on ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container"}`;

/** Bật/tắt từng lớp pinyin và bản dịch (LS-03). Dùng ở thanh trên (desktop) và đầu danh sách lời (mobile). */
export function ViewToggles({ showPinyin, showTranslation, onTogglePinyin, onToggleTranslation, className = "" }: ViewTogglesProps) {
  return (
    <div role="group" aria-label="Lớp hiển thị" className={`items-center gap-1 ${className}`}>
      <button type="button" aria-pressed={showPinyin} onClick={onTogglePinyin} className={toggleClass(showPinyin)}>
        <Icon name="translate" size={18} />
        Pinyin
      </button>
      <button type="button" aria-pressed={showTranslation} onClick={onToggleTranslation} className={toggleClass(showTranslation)}>
        <Icon name="subtitles" size={18} />
        Bản dịch
      </button>
    </div>
  );
}
