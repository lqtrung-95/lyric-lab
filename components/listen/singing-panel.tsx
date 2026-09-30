"use client";

import { useState } from "react";
import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { levelLabel } from "@/lib/preview/preview-format";
import { itemKey } from "@/lib/user-state/learner-state";

interface SingingPanelProps {
  line: AnalyzedLine | null;
  items: PreviewItem[];
  savedKeys: ReadonlySet<string>;
  onToggleSave: (item: PreviewItem) => void;
}

function ItemCard({ item, saved, onToggleSave }: { item: PreviewItem; saved: boolean; onToggleSave: (i: PreviewItem) => void }) {
  const isVocab = item.type === "vocab";
  return (
    <li className={`relative overflow-hidden rounded-xl bg-surface-container-lowest p-4 shadow-sm ${isVocab ? "" : "pl-5"}`}>
      {!isVocab && <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-secondary" />}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p lang="zh" className={`font-serif ${isVocab ? "text-hanzi-display text-on-surface" : "text-headline-md text-secondary"}`}>{item.term}</p>
          {isVocab && (
            <p className="text-pinyin-reading text-primary">
              {item.reading}
              {item.sinoViet && <span className="ml-2 text-hanviet-reading uppercase text-secondary"><span className="sr-only">Hán Việt: </span>{item.sinoViet}</span>}
            </p>
          )}
        </div>
        <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(item.level)}</span>
      </div>
      <p className="mt-2 text-body-md text-on-surface">{item.meaningInContext}</p>
      {item.explanation && <p className="mt-1 text-label-md text-on-surface-variant">{item.explanation}</p>}
      {item.example && <p className="mt-2 text-label-md text-on-surface-variant"><span lang="zh" className="font-serif text-body-md text-on-surface">{item.example.zh}</span> — {item.example.vi}</p>}
      <button type="button" aria-pressed={saved} onClick={() => onToggleSave(item)}
        className={`mt-2 inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md hover:bg-surface-container ${saved ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
        <Icon name={saved ? "star" : "star_border"} filled={saved} size={18} />
        {saved ? "Đã lưu" : "Lưu"}
      </button>
    </li>
  );
}

/**
 * Panel "Đang hát" (LS-05): thẻ của các mục nằm trong câu đang hát, cập nhật theo thời gian phát.
 * Desktop là cột bên phải; mobile là bottom sheet thu gọn mặc định.
 */
export function SingingPanel({ line, items, savedKeys, onToggleSave }: SingingPanelProps) {
  const [open, setOpen] = useState(false);
  const title = line ? `Câu ${String(line.index + 1).padStart(2, "0")} đang phát` : "Chưa vào bài";

  return (
    <aside
      aria-label="Từ và ngữ pháp trong câu đang hát"
      className="fixed inset-x-0 bottom-0 z-30 rounded-t-2xl bg-surface-container-low shadow-[0_-4px_24px_rgba(30,26,22,0.15)] lg:static lg:rounded-2xl lg:bg-transparent lg:shadow-none"
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex min-h-14 w-full items-center justify-between px-4 lg:hidden"
      >
        <span className="text-label-md font-semibold text-on-surface">Đang hát · {title} · {items.length} mục</span>
        <Icon name={open ? "expand_more" : "expand_less"} size={22} />
      </button>
      <div className={`${open ? "block" : "hidden"} max-h-[55vh] overflow-y-auto px-4 pb-4 lg:block lg:max-h-none lg:overflow-visible lg:p-0`}>
        <div className="mb-3 hidden items-center justify-between lg:flex">
          <h2 className="flex items-center gap-2 font-serif text-headline-md text-on-surface">
            <Icon name="menu_book" size={20} className="text-secondary" />
            Từ & Ngữ pháp trong bài
          </h2>
          <span className="rounded-full bg-surface-container-high px-2.5 py-0.5 text-label-sm text-on-surface-variant">{title}</span>
        </div>
        {items.length === 0 ? (
          <p className="rounded-xl bg-surface-container p-4 text-body-md text-on-surface-variant">
            {line ? "Câu này chưa có từ hay mẫu nổi bật. Cứ nghe tiếp nhé." : "Bấm phát để bắt đầu. Từ và ngữ pháp của câu đang hát sẽ hiện ở đây."}
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {items.map((item) => <ItemCard key={item.id} item={item} saved={savedKeys.has(itemKey(item))} onToggleSave={onToggleSave} />)}
          </ul>
        )}
      </div>
    </aside>
  );
}
