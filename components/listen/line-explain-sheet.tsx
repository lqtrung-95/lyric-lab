"use client";

import { useEffect, useRef } from "react";
import { Icon } from "@/components/ui/icon";
import type { LineExplainResult } from "./use-line-explain";

const FAIL_TEXT = {
  rate_limited: "Bạn đã giải thích nhiều câu trong hôm nay, mai thử lại nhé.",
  error: "Chưa giải thích được lúc này. Thử lại sau nhé.",
} as const;

const sectionTitle = "text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant";

/** Bottom sheet hiện kết quả giải thích cả câu đang hát: dịch tự nhiên, từ vựng, điểm ngữ pháp, ghi chú khác. */
export function LineExplainSheet({ lineText, linePinyin, result, onClose }: { lineText: string; linePinyin?: string; result: LineExplainResult; onClose: () => void }) {
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
      className="fixed inset-x-0 bottom-0 z-50 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-5 shadow-[0_-4px_24px_rgba(30,26,22,0.2)] outline-none md:inset-x-auto md:bottom-6 md:right-6 md:w-[26rem] md:rounded-2xl"
    >
      {/* Không bù lề âm cho header sticky như vài popup khác trong app: dialog này cuộn dọc CHỈ trong phạm vi đã
          có `p-5` của chính nó (không có nội dung nào tràn ra ngoài theo chiều ngang), nên không cần header tự "tràn
          lề" rồi đệm lại — làm vậy từng vô tình cộng dồn padding-top (lề ngoài 20px + đệm lại 20px = 40px, thừa hẳn
          20px). Header dùng thẳng lề có sẵn của dialog, chỉ thêm đệm dưới trước khi vào nội dung. */}
      <div className="sticky top-0 bg-surface-container-lowest pb-3">
        <div className="flex items-center justify-between gap-3">
          <p lang="zh" className="font-serif text-hanzi-body text-on-surface">{lineText}</p>
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={20} />
          </button>
        </div>
        {linePinyin && <p className="mt-1 text-pinyin-reading text-primary">{linePinyin}</p>}
      </div>

      {result.status === "ok" ? (
        <div className="space-y-4">
          <section aria-label="Dịch">
            <h3 className={sectionTitle}>Dịch</h3>
            <p className="mt-1 text-body-md font-medium text-on-surface">{result.value.translation}</p>
          </section>

          {result.value.vocabulary.length > 0 && (
            <section aria-label="Từ vựng">
              <h3 className={sectionTitle}>Từ vựng</h3>
              <ol className="mt-1 space-y-1.5">
                {result.value.vocabulary.map((v, i) => (
                  <li key={i} className="text-label-md text-on-surface">
                    <span lang="zh" className="font-serif font-semibold">{v.term}</span>
                    {v.pinyin && <span className="text-on-surface-variant"> ({v.pinyin})</span>}
                    {": "}
                    <span className="text-on-surface-variant">{v.meaning}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {result.value.grammarPoints.length > 0 && (
            <section aria-label="Điểm ngữ pháp">
              <h3 className={sectionTitle}>Điểm ngữ pháp</h3>
              <ol className="mt-1 space-y-2">
                {result.value.grammarPoints.map((g, i) => (
                  <li key={i} className="text-label-md">
                    <span className="font-semibold text-on-surface">{g.title}</span>
                    {": "}
                    <span className="text-on-surface-variant">{g.explanation}</span>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {result.value.notes.length > 0 && (
            <section aria-label="Các điểm đáng chú ý khác">
              <h3 className={sectionTitle}>Các điểm đáng chú ý khác</h3>
              <ul className="mt-1 list-disc space-y-1.5 pl-4">
                {result.value.notes.map((n, i) => (
                  <li key={i} className="text-label-md text-on-surface-variant">{n}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      ) : result.status === "error" ? (
        <p role="status" className="text-label-md text-on-surface-variant">{FAIL_TEXT[result.reason]}</p>
      ) : (
        // Mô phỏng đúng cỡ các mục thật (Dịch, Từ vựng, Điểm ngữ pháp) để khung popup không nhảy cỡ lúc dữ liệu về.
        <div role="status" aria-label="Đang giải thích" className="space-y-4">
          <div className="space-y-2">
            <div className="h-3 w-16 animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-4/5 animate-pulse rounded bg-surface-container-high" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-14 animate-pulse rounded bg-surface-container-high" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-4 animate-pulse rounded bg-surface-container-high" style={{ width: `${85 - i * 6}%` }} />
            ))}
          </div>
          <div className="space-y-2">
            <div className="h-3 w-24 animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-full animate-pulse rounded bg-surface-container-high" />
          </div>
        </div>
      )}
    </div>
  );
}
