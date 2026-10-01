"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import { LyricOffsetPopover } from "./lyric-offset-popover";

interface MoreActionsSheetProps {
  offset: number;
  onOffsetChange: (offset: number) => void;
  /** Ghim: tắt tự cuộn theo câu đang hát để đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onExplain: () => void;
  explainDisabled: boolean;
  onPractice: () => void;
  practiceDisabled: boolean;
  onClose: () => void;
}

const actionRow = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-label-lg text-on-surface hover:bg-surface-container-high disabled:opacity-50";

/**
 * Popup "Thêm" cho điện thoại: gom các điều khiển không dùng liên tục (canh lời lệch, ghim tự cuộn, giải thích AI,
 * luyện phát âm) ra khỏi hàng nút chính để hàng chính (lùi/phát/tới/lặp câu/tốc độ) vừa một hàng, không phải cuộn.
 */
export function MoreActionsSheet({ offset, onOffsetChange, autoScroll, onToggleAutoScroll, onExplain, explainDisabled, onPractice, practiceDisabled, onClose }: MoreActionsSheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  const pinned = !autoScroll;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center sm:p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-label="Thêm điều khiển"
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-sm overflow-y-auto rounded-t-2xl bg-surface-container-highest p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-[0_8px_40px_rgba(30,26,22,0.3)] outline-none sm:rounded-2xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-label-md font-semibold text-on-surface">Thêm</h2>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={20} />
          </button>
        </div>

        <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="mt-3" />

        <button type="button" onClick={onToggleAutoScroll} aria-pressed={pinned} className={`${actionRow} mt-2 ${pinned ? "bg-primary/15 text-primary" : ""}`}>
          <Icon name="push_pin" size={20} />
          {pinned ? "Bỏ ghim tự cuộn" : "Ghim, không tự cuộn theo câu đang hát"}
        </button>
        <button type="button" disabled={explainDisabled} onClick={() => { onExplain(); onClose(); }} className={actionRow}>
          <Icon name="auto_awesome" size={20} />
          Giải thích câu đang hát bằng AI
        </button>
        <button type="button" disabled={practiceDisabled} onClick={() => { onPractice(); onClose(); }} className={actionRow}>
          <Icon name="mic" size={20} />
          Luyện phát âm câu đang hát
        </button>
      </div>
    </div>
  );
}
