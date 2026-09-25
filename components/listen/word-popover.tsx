"use client";

import { useEffect, useRef } from "react";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { levelLabel } from "@/lib/preview/preview-format";
import type { WordSelection } from "./lyric-line-row";
import type { LookupState } from "./use-term-lookup";

interface WordPopoverProps {
  word: WordSelection;
  /** Mục học có sẵn nếu từ nằm trong danh sách (dùng ngay, không cần gọi mạng). */
  item: PreviewItem | null;
  lookup: LookupState;
  saved: boolean;
  onClose: () => void;
  onPlayLine: () => void;
  onToggleSave: (term: string) => void;
}

const FAIL_TEXT = {
  rate_limited: "Bạn đã tra nhiều từ trong hôm nay, mai thử lại nhé.",
  not_available: "Chưa giải nghĩa được từ này.",
  error: "Chưa giải nghĩa được lúc này. Thử lại sau nhé.",
} as const;

/**
 * Popover tra từ (S6): chữ Hán, pinyin, Hán Việt, cấp HSK, nghĩa từ điển và nghĩa theo ngữ cảnh câu hát.
 * Chỉ mở khi người dùng bấm (không tự bật khi đang nghe). Desktop: thẻ nổi góc dưới phải (không che cột lời); mobile: bottom sheet.
 */
export function WordPopover({ word, item, lookup, saved, onClose, onPlayLine, onToggleSave }: WordPopoverProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    return () => previous?.focus?.();
  }, [word]);

  const entry = lookup.entry?.ok ? lookup.entry.value : undefined;
  const reading = item?.reading ?? entry?.pinyin;
  const sinoViet = item?.sinoViet ?? entry?.sinoViet ?? undefined;
  const level = item ? item.level : entry?.hskLevel;
  const saveTerm = item?.term ?? entry?.term ?? word.term;

  const meaning = item
    ? { text: item.meaningInContext, note: item.explanation }
    : lookup.meaning?.ok ? { text: lookup.meaning.value.meaningInContext, note: lookup.meaning.value.note } : null;
  const meaningFailure = !item && lookup.meaning && !lookup.meaning.ok ? FAIL_TEXT[lookup.meaning.reason] : null;

  return (
    <div
      ref={ref}
      role="dialog"
      aria-label={`Tra từ ${word.term}`}
      tabIndex={-1}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      className="fixed inset-x-0 bottom-0 z-50 max-h-[70vh] overflow-y-auto rounded-t-2xl bg-surface-container-lowest p-5 shadow-[0_-4px_24px_rgba(30,26,22,0.2)] outline-none md:inset-x-auto md:bottom-6 md:right-6 md:w-96 md:rounded-2xl"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p lang="zh" className="font-serif text-hanzi-display text-on-surface">{word.term}</p>
          <p className="flex flex-wrap items-center gap-x-2 text-pinyin-reading text-primary">
            {reading ?? (lookup.entry === undefined && !item ? <span className="inline-block h-4 w-20 animate-pulse rounded bg-surface-container-high" /> : null)}
            {sinoViet && <span className="text-hanviet-reading uppercase tracking-wider text-secondary"><span className="sr-only">Hán Việt: </span>{sinoViet}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {level !== undefined && <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(level)}</span>}
          <button type="button" aria-label="Đóng" onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high">
            <Icon name="close" size={20} />
          </button>
        </div>
      </div>

      <section aria-label="Nghĩa trong bài" className="mt-3">
        <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Nghĩa trong bài</h3>
        {meaning ? (
          <>
            <p className="mt-1 text-body-md font-medium text-on-surface">{meaning.text}</p>
            {meaning.note && <p className="mt-1 text-label-md text-on-surface-variant">{meaning.note}</p>}
          </>
        ) : meaningFailure ? (
          <p role="status" className="mt-1 text-label-md text-on-surface-variant">{meaningFailure}</p>
        ) : (
          <div role="status" aria-label="Đang giải nghĩa" className="mt-2 space-y-2">
            <div className="h-4 w-3/4 animate-pulse rounded bg-surface-container-high" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-surface-container-high" />
          </div>
        )}
      </section>

      {!item && lookup.entry !== undefined && (
        <section aria-label="Từ điển" className="mt-3">
          <h3 className="text-label-sm font-semibold uppercase tracking-wider text-on-surface-variant">Từ điển</h3>
          {entry ? (
            <ul className="mt-1 list-disc pl-5 text-label-md text-on-surface-variant">{entry.meanings.map((m) => <li key={m}>{m}</li>)}</ul>
          ) : (
            <p className="mt-1 text-label-md text-on-surface-variant">Chưa có trong từ điển.</p>
          )}
        </section>
      )}

      <div className="mt-4 flex items-center gap-2 border-t border-surface-container-high pt-3">
        <button type="button" onClick={onPlayLine} className="inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md font-semibold text-primary hover:bg-surface-container">
          <Icon name="play_circle" size={20} />
          Nghe câu này
        </button>
        <button type="button" aria-pressed={saved} onClick={() => onToggleSave(saveTerm)}
          className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md hover:bg-surface-container ${saved ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
          <Icon name={saved ? "star" : "star_border"} filled={saved} size={18} />
          {saved ? "Đã lưu" : "Lưu"}
        </button>
      </div>
    </div>
  );
}
