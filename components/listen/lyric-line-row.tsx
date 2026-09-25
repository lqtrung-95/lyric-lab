"use client";

import { memo } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { buildLineSegments, type HighlightSets } from "@/lib/listen/line-segments";

export type LineState = "past" | "active" | "upcoming";

/** Từ người dùng bấm để tra: dạng chữ như trong lời và mục từ vựng nếu có. */
export interface WordSelection {
  lineIndex: number;
  term: string;
  itemId?: string;
}

interface LyricLineRowProps {
  line: AnalyzedLine;
  state: LineState;
  showPinyin: boolean;
  showTranslation: boolean;
  highlights: HighlightSets;
  sinoVietById: ReadonlyMap<string, string>;
  onSeek: (index: number) => void;
  onWord: (word: WordSelection) => void;
}

/**
 * Một dòng lời. Từ vựng được tô nền + đậm (kèm nhãn ẩn cho trình đọc màn hình), ngữ pháp được gạch chân:
 * hai kiểu khác nhau về hình dạng chứ không chỉ về màu (LS-04). Bấm dòng để nhảy tới đó (LS-07).
 */
function LyricLineRowImpl({ line, state, showPinyin, showTranslation, highlights, sinoVietById, onSeek, onWord }: LyricLineRowProps) {
  const active = state === "active";
  const groups = buildLineSegments(line, highlights);

  return (
    <li
      data-line-index={line.index}
      aria-current={active ? "true" : undefined}
      onClick={() => onSeek(line.index)}
      className={`relative flex cursor-pointer items-start gap-3 rounded-xl p-3.5 transition-colors ${
        active ? "bg-surface-container p-5 shadow-md" : state === "past" ? "opacity-60 hover:bg-surface-container-low/50" : "hover:bg-surface-container-low/50"
      }`}
    >
      {active && <div aria-hidden="true" className="absolute -left-1 bottom-4 top-4 w-2 rounded-full bg-primary" />}
      <button
        type="button"
        aria-label={`Phát từ câu ${line.index + 1}`}
        onClick={(e) => { e.stopPropagation(); onSeek(line.index); }}
        className={`mt-0.5 min-h-11 w-11 shrink-0 text-left text-label-sm ${active ? "font-bold text-primary" : "text-on-surface-variant"}`}
      >
        {String(line.index + 1).padStart(2, "0")}
      </button>
      <div className="flex min-w-0 flex-col gap-1">
        {showPinyin && <p className={`text-pinyin-reading tracking-wide ${active ? "text-on-surface" : "text-on-surface-variant"}`}>{line.pinyin}</p>}
        <p className={`flex flex-wrap items-baseline gap-x-0.5 font-serif ${active ? "text-headline-lg-mobile leading-tight md:text-headline-lg" : "text-hanzi-body"} text-on-surface`}>
          {groups.map((g) => {
            const content = g.parts.map((part, i) =>
              part.grammarId
                ? <span key={i} className="border-b-2 border-secondary font-semibold text-secondary">{part.text}</span>
                : <span key={i}>{part.text}</span>,
            );
            if (!g.isHan) return <span key={g.tokenIndex}>{content}</span>;
            const sinoViet = g.vocabId ? sinoVietById.get(g.vocabId) : undefined;
            return (
              <button
                key={g.tokenIndex}
                type="button"
                lang="zh"
                title="Bấm để tra từ"
                onClick={(e) => { e.stopPropagation(); onWord({ lineIndex: line.index, term: g.text, itemId: g.vocabId }); }}
                className={
                  g.vocabId
                    ? "mx-0.5 inline-flex items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary ring-2 ring-primary/20"
                    : "rounded px-0.5 hover:bg-primary/10 hover:text-primary"
                }
              >
                {g.vocabId && <span className="sr-only">Từ vựng: </span>}
                {content}
                {active && sinoViet && <span className="text-[11px] font-semibold uppercase text-primary">[{sinoViet}]</span>}
              </button>
            );
          })}
        </p>
        {showTranslation && line.translation && (
          <p className={active ? "text-body-lg font-medium text-primary" : "text-body-md italic text-on-surface-variant/80"}>{line.translation}</p>
        )}
      </div>
    </li>
  );
}

export const LyricLineRow = memo(LyricLineRowImpl);
