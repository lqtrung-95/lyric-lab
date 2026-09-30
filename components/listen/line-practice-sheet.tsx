"use client";

import { useEffect, useRef } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { LinePracticeCard } from "./line-practice-card";

interface LinePracticeSheetProps {
  line: AnalyzedLine;
  onListenLine: () => void;
  onPauseSong: () => void;
  onClose: () => void;
}

/**
 * Popup luyện phát âm kiểu Miraa: mở riêng cho câu đã chọn lúc bấm nút, giữ nguyên nội dung câu đó trong suốt
 * lúc luyện dù nhạc nền có chạy tiếp hay đổi câu — khác với gắn thẳng vào panel "Đang hát" (đổi theo câu đang phát
 * từng 100 ms) vốn dễ bị mất trạng thái luyện giữa chừng ngay khi nhạc vừa lệch sang câu kế tiếp.
 */
export function LinePracticeSheet({ line, onListenLine, onPauseSong, onClose }: LinePracticeSheetProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // preventScroll: true — mặc định focus() kéo trình duyệt cuộn trang tới phần tử nhận focus, làm lời bài hát
    // phía sau nhảy vị trí cả lúc mở popup lẫn lúc đóng (trả focus về nút đã bấm mở).
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div
        ref={ref}
        role="dialog"
        aria-label={`Luyện phát âm câu ${line.text}`}
        tabIndex={-1}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-2xl bg-surface-container-highest p-4 shadow-[0_8px_40px_rgba(30,26,22,0.3)] outline-none"
      >
        <div className="sticky top-0 -mt-4 -mx-4 flex items-center justify-between gap-3 border-b border-outline-variant/30 bg-surface-container-highest px-4 pb-3 pt-4">
          <div>
            <p lang="zh" className="font-serif text-hanzi-body text-on-surface">{line.text}</p>
            <p className="text-pinyin-reading text-primary">{line.pinyin}</p>
          </div>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="pt-3">
          <LinePracticeCard line={line} onListenLine={onListenLine} onPauseSong={onPauseSong} />
        </div>
      </div>
    </div>
  );
}
