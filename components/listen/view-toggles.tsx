"use client";

import { Icon } from "@/components/ui/icon";

interface ViewTogglesProps {
  showPinyin: boolean;
  showTranslation: boolean;
  onTogglePinyin: () => void;
  onToggleTranslation: () => void;
  className?: string;
  /** Chỉ hiện biểu tượng (nhãn chỉ hiện từ màn rộng 2xl) để thanh tiêu đề đỡ chật; tên truy cập vẫn đầy đủ. */
  compact?: boolean;
}

const toggleClass = (on: boolean, compact: boolean) =>
  `inline-flex min-h-11 items-center ${compact ? "gap-1.5 px-2.5 text-label-sm" : "gap-2 px-3 text-label-md"} rounded-full transition-colors ${on ? "bg-surface-container-high text-on-surface" : "text-on-surface-variant hover:bg-surface-container"}`;

/** Bật/tắt từng lớp pinyin và bản dịch (LS-03). Dùng ở thanh trên (desktop) và đầu danh sách lời (mobile). */
export function ViewToggles({ showPinyin, showTranslation, onTogglePinyin, onToggleTranslation, className = "", compact = false }: ViewTogglesProps) {
  return (
    <div role="group" aria-label="Lớp hiển thị" data-tour="view-toggles" className={`items-center gap-1 ${className}`}>
      <button type="button" aria-pressed={showPinyin} onClick={onTogglePinyin} aria-label="Pinyin" title="Pinyin" className={toggleClass(showPinyin, compact)}>
        <Icon name="translate" size={compact ? 16 : 18} />
        <span className={compact ? "hidden 2xl:inline" : ""}>Pinyin</span>
      </button>
      <button type="button" aria-pressed={showTranslation} onClick={onToggleTranslation} aria-label="Bản dịch" title="Bản dịch" className={toggleClass(showTranslation, compact)}>
        <Icon name="subtitles" size={compact ? 16 : 18} />
        <span className={compact ? "hidden 2xl:inline" : ""}>Bản dịch</span>
      </button>
    </div>
  );
}
