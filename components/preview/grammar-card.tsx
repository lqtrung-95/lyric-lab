"use client";

import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { levelLabel, lineForItem } from "@/lib/preview/preview-format";
import { QuoteBox } from "./quote-box";
import { ReportMenu } from "./report-menu";

interface GrammarCardProps {
  item: PreviewItem;
  index: number;
  lines: AnalyzedLine[];
  videoId: string;
  promptVersion: string;
  saved: boolean;
  onPlay: (item: PreviewItem, line: AnalyzedLine) => void;
  onToggleSave: (item: PreviewItem, line: AnalyzedLine | null) => void;
  onKnown: (item: PreviewItem) => void;
}

/** Thẻ ngữ pháp (S4): công thức, giải thích, ví dụ do AI đặt, lỗi hay gặp của người Việt, câu trong bài. */
export function GrammarCard({ item, index, lines, videoId, promptVersion, saved, onPlay, onToggleSave, onKnown }: GrammarCardProps) {
  const line = lineForItem(item, lines);
  return (
    <article className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-5 shadow-sm">
      <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-secondary" />
      <div className="mb-2 flex items-start justify-between gap-2">
        <span className="text-label-sm font-bold uppercase tracking-wider text-secondary">Mẫu {String(index + 1).padStart(2, "0")}</span>
        <span className="rounded-full bg-surface-container px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(item.level)}</span>
      </div>
      <h3 lang="zh" className="mb-2 rounded-lg bg-surface-container-low px-3 py-2 font-serif text-headline-md text-secondary">{item.term}</h3>
      <p className="mb-3 text-body-md text-on-surface">{item.meaningInContext}</p>

      {item.example && (
        <div className="mb-3 flex flex-col gap-1 rounded-lg bg-surface-container-low p-3">
          <span className="text-label-sm font-semibold text-on-surface-variant">Ví dụ mới (AI đặt):</span>
          <p lang="zh" className="font-serif text-hanzi-body text-on-surface">{item.example.zh}</p>
          <p className="text-body-md text-on-surface-variant">{item.example.vi}</p>
        </div>
      )}
      {line && <div className="mb-3"><QuoteBox line={line} label="Câu trong bài" /></div>}
      {item.commonMistake && (
        <div className="mb-3 flex items-start gap-2 rounded-lg bg-error-container/40 p-2.5">
          <Icon name="warning" size={18} className="mt-0.5 text-error" />
          <p className="text-label-md text-on-surface-variant"><span className="font-bold text-error">Lỗi thường gặp: </span>{item.commonMistake}</p>
        </div>
      )}

      <div className="flex items-center justify-between border-t border-surface-container-high/60 pt-2">
        {line ? (
          <button type="button" onClick={() => onPlay(item, line)} aria-label={`Nghe câu chứa mẫu ${item.term}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-label-md font-semibold text-secondary hover:bg-surface-container">
            <Icon name="play_circle" size={20} />
            Nghe câu này
          </button>
        ) : <span />}
        <div className="flex items-center gap-1">
          <button type="button" aria-pressed={saved} onClick={() => onToggleSave(item, line)}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md hover:bg-surface-container ${saved ? "font-semibold text-primary" : "text-on-surface-variant"}`}>
            <Icon name={saved ? "star" : "star_border"} filled={saved} size={18} />
            {saved ? "Đã lưu" : "Lưu"}
          </button>
          <button type="button" onClick={() => onKnown(item)} className="min-h-11 rounded-full bg-surface-container px-3 text-label-md text-on-surface-variant hover:bg-surface-container-highest">
            Đã biết
          </button>
          <ReportMenu videoId={videoId} itemId={item.id} promptVersion={promptVersion} termLabel={item.term} />
        </div>
      </div>
    </article>
  );
}
