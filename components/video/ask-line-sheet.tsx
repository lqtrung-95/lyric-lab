"use client";

import { useEffect, useRef } from "react";
import { AskLineBox } from "@/components/listen/ask-line-box";
import { Icon } from "@/components/ui/icon";

/** Bảng hỏi AI về một câu của video (video luyện nghe không có bảng "Giải thích câu" như bài hát): hiện câu đang hỏi rồi khung hỏi-đáp. */
export function AskLineSheet({ videoId, lineIndex, lineText, translation, onClose }: { videoId: string; lineIndex: number; lineText: string; translation?: string; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus({ preventScroll: true });
    return () => previous?.focus?.({ preventScroll: true });
  }, []);
  return (
    <div
      ref={ref} role="dialog" aria-label={`Hỏi AI về câu ${lineText}`} tabIndex={-1} onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-5 shadow-[0_-4px_24px_rgba(30,26,22,0.2)] outline-none md:inset-x-auto md:bottom-6 md:right-6 md:w-[26rem] md:rounded-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p lang="zh" className="font-serif text-hanzi-body text-on-surface">{lineText}</p>
          {translation && <p className="mt-1 text-label-md italic text-on-surface-variant">{translation}</p>}
        </div>
        <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high"><Icon name="close" size={20} /></button>
      </div>
      <AskLineBox videoId={videoId} lineIndex={lineIndex} />
    </div>
  );
}
