"use client";

import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { displayTermForm, levelLabel, lineForItem } from "@/lib/preview/preview-format";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { QuoteBox } from "./quote-box";
import { ReportMenu } from "./report-menu";

interface VocabCardProps {
  item: PreviewItem;
  lines: AnalyzedLine[];
  videoId: string;
  promptVersion: string;
  saved: boolean;
  onPlay: (item: PreviewItem, line: AnalyzedLine) => void;
  onToggleSave: (item: PreviewItem, line: AnalyzedLine | null) => void;
  onKnown: (item: PreviewItem) => void;
}

/** Thẻ từ vựng (S4): chữ Hán lớn nhất, rồi pinyin và Hán Việt, level, nghĩa, trích đoạn, hành động. */
export function VocabCard({ item, lines, videoId, promptVersion, saved, onPlay, onToggleSave, onKnown }: VocabCardProps) {
  const line = lineForItem(item, lines);
  const hanzi = displayTermForm(item, lines);

  return (
    <article className="flex flex-col justify-between gap-4 rounded-xl bg-surface-container-lowest p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col">
            <h3 lang="zh" className="font-serif text-hanzi-display tracking-wide text-on-surface">{hanzi}</h3>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-pinyin-reading text-primary">
              <span>{item.reading}</span>
              {item.sinoViet && (
                <>
                  <span aria-hidden="true" className="text-label-sm text-outline">•</span>
                  <span className="text-hanviet-reading uppercase tracking-wider text-secondary">
                    <span className="sr-only">Hán Việt: </span>{item.sinoViet}
                  </span>
                </>
              )}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PronounceButton text={hanzi} />
            <span className="rounded-full bg-surface-container-high px-2 py-0.5 text-label-sm text-on-surface-variant">{levelLabel(item.level)}</span>
          </div>
        </div>
        <p className="text-body-md font-medium text-on-surface">{item.meaningInContext}</p>
        {item.explanation && <p className="text-label-md text-on-surface-variant">{item.explanation}</p>}
        {line && <QuoteBox line={line} label="Trích đoạn lời bài hát" />}
      </div>

      <div className="flex items-center justify-between border-t border-surface-container-high/60 pt-2">
        {line ? (
          <button
            type="button"
            onClick={() => onPlay(item, line)}
            aria-label={`Nghe đoạn chứa ${hanzi}`}
            className="inline-flex min-h-11 items-center gap-1 rounded-full px-2 text-label-md font-semibold text-primary hover:bg-surface-container"
          >
            <Icon name="play_circle" size={20} />
            Nghe đoạn này
          </button>
        ) : <span />}
        <div className="flex items-center gap-1">
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => onToggleSave(item, line)}
            className={`inline-flex min-h-11 items-center gap-1 rounded-full px-3 text-label-md hover:bg-surface-container ${saved ? "font-semibold text-primary" : "text-on-surface-variant"}`}
          >
            <Icon name={saved ? "star" : "star_border"} filled={saved} size={18} />
            {saved ? "Đã lưu" : "Lưu"}
          </button>
          <button
            type="button"
            onClick={() => onKnown(item)}
            className="min-h-11 rounded-full bg-surface-container px-3 text-label-md text-on-surface-variant hover:bg-surface-container-highest"
          >
            Đã biết
          </button>
          <ReportMenu videoId={videoId} itemId={item.id} promptVersion={promptVersion} termLabel={hanzi} />
        </div>
      </div>
    </article>
  );
}
