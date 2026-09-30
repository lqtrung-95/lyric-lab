"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import type { LineExplainResult } from "./use-line-explain";

const FAIL_TEXT = {
  rate_limited: "Bạn đã giải thích nhiều câu trong hôm nay, mai thử lại nhé.",
  error: "Chưa giải thích được lúc này. Thử lại sau nhé.",
} as const;

/** Bottom sheet hiện kết quả giải thích cả câu đang hát (nghĩa tự nhiên hơn bản dịch máy, kèm ghi chú ngữ pháp). */
export function LineExplainSheet({ lineText, result, onClose }: { lineText: string; result: LineExplainResult; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus?.();
  }, []);

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Giải thích câu ${lineText}`}
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-5 shadow-[0_-4px_24px_rgba(30,26,22,0.2)] outline-none md:inset-x-auto md:bottom-6 md:right-6 md:w-96 md:rounded-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <p lang="zh" className="font-serif text-hanzi-body text-on-surface">{lineText}</p>
        <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
          <Icon name="close" size={20} />
        </button>
      </div>

      <section aria-label="Giải thích" className="mt-3">
        <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Ý nghĩa câu này</h3>
        {result.status === "ok" ? (
          <>
            <p className="mt-1 text-body-md font-medium text-on-surface">{result.value.meaning}</p>
            {result.value.grammarNote && (
              <>
                <h3 className="mt-3 text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Ngữ pháp</h3>
                <p className="mt-1 text-label-md text-on-surface-variant">{result.value.grammarNote}</p>
              </>
            )}
          </>
        ) : result.status === "error" ? (
          <p role="status" className="mt-1 text-label-md text-on-surface-variant">{FAIL_TEXT[result.reason]}</p>
        ) : (
          <div role="status" aria-label="Đang giải thích" className="mt-2 space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-high" />
          </div>
        )}
      </section>
    </div>
  );
}
