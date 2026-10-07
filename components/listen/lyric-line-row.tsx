"use client";

import { memo } from "react";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { buildLineSegments, type HighlightSets } from "@/lib/listen/line-segments";
import { Icon } from "@/components/ui/icon";
import { TranslationSuggestionButton } from "./translation-suggestion-button";

export type LineState = "past" | "active" | "upcoming";

/** Từ người dùng bấm để tra: dạng chữ như trong lời và mục từ vựng nếu có. */
export interface WordSelection {
  lineIndex: number;
  term: string;
  itemId?: string;
}

interface LyricLineRowProps {
  videoId: string;
  promptVersion: string;
  line: AnalyzedLine;
  state: LineState;
  showPinyin: boolean;
  showTranslation: boolean;
  highlights: HighlightSets;
  onSeek: (index: number) => void;
  onWord: (word: WordSelection) => void;
  onPauseSong: () => void;
  /** Cho gợi ý sửa bản dịch của cộng đồng (chỉ có ở bài hát; video luyện nghe không dùng). Mặc định bật. */
  allowTranslationSuggestion?: boolean;
  /** Có thì hiện nút chia sẻ câu này dưới dạng ảnh. */
  onShare?: (index: number) => void;
}

/**
 * Một dòng lời. Từ vựng được tô nền + đậm (kèm nhãn ẩn cho trình đọc màn hình), ngữ pháp được gạch chân:
 * hai kiểu khác nhau về hình dạng chứ không chỉ về màu (LS-04). Bấm dòng để nhảy tới đó (LS-07).
 */
function LyricLineRowImpl({ videoId, promptVersion, line, state, showPinyin, showTranslation, highlights, onSeek, onWord, onPauseSong, allowTranslationSuggestion = true, onShare }: LyricLineRowProps) {
  const active = state === "active";
  const groups = buildLineSegments(line, highlights);

  return (
    <li
      data-line-index={line.index}
      aria-current={active ? "true" : undefined}
      onClick={() => onSeek(line.index)}
      className={`group/line relative flex cursor-pointer items-start gap-3 rounded-xl p-3.5 transition-colors ${
        active ? "bg-surface-container p-5 shadow-md" : state === "past" ? "opacity-60 hover:bg-surface-container-low/50" : "hover:bg-surface-container-low/50"
      }`}
    >
      {active && <div aria-hidden="true" className="absolute -left-1 bottom-4 top-4 w-2 rounded-full bg-primary" />}
      <button
        type="button"
        aria-label={`Phát từ câu ${line.index + 1}`}
        onClick={(e) => { e.stopPropagation(); onSeek(line.index); }}
        className={`mt-0.5 min-h-11 w-11 shrink-0 cursor-pointer text-left text-label-sm ${active ? "font-bold text-primary" : "text-on-surface-variant"}`}
      >
        {String(line.index + 1).padStart(2, "0")}
      </button>
      <div className="flex min-w-0 flex-col gap-1">
        <p className={`flex flex-wrap items-end gap-x-0.5 font-serif ${active ? "text-headline-lg-mobile leading-tight md:text-headline-lg" : "text-hanzi-body"} text-on-surface`}>
          {groups.map((g) => {
            const pinyinClass = `text-pinyin-reading font-sans ${active ? "text-on-surface" : "text-on-surface-variant"}`;
            const content = g.parts.map((part, i) => {
              const chars = showPinyin && part.pinyinChars
                ? [...part.text].map((ch, k) => (
                    <ruby key={k}>
                      {ch}
                      <rt className={pinyinClass}>{part.pinyinChars![k] ?? ""}</rt>
                    </ruby>
                  ))
                : part.text;
              return part.grammarId
                ? <span key={i} className="border-b-2 border-secondary font-semibold text-secondary">{chars}</span>
                : <span key={i}>{chars}</span>;
            });
            if (!g.isHan) return <span key={g.tokenIndex}>{content}</span>;
            return (
              <button
                key={g.tokenIndex}
                type="button"
                lang="zh"
                title="Bấm để tra từ"
                // Đặt tên tường minh thay vì để trình duyệt tự tính từ nội dung: chữ Hán lồng trong <ruby>/<rt> khiến
                // vài trình duyệt tính accessible-name-từ-nội-dung ra rỗng rồi rơi về title ("Bấm để tra từ" cho mọi
                // nút), hoặc lẫn cả pinyin vào tên nếu không kiểm soát — đặt aria-label giữ tên nút luôn đúng = g.text.
                aria-label={g.vocabId ? `Từ vựng: ${g.text}` : g.text}
                onClick={(e) => { e.stopPropagation(); onWord({ lineIndex: line.index, term: g.text, itemId: g.vocabId }); }}
                className={
                  g.vocabId
                    ? "mx-0.5 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary/15 px-2 py-0.5 font-bold text-primary ring-2 ring-primary/20"
                    : "cursor-pointer rounded px-0.5 hover:bg-primary/10 hover:text-primary"
                }
              >
                {content}
              </button>
            );
          })}
        </p>
        {showTranslation && line.translation && (
          <div className="flex items-center gap-1">
            <p className={active ? "text-body-lg font-medium text-primary" : "text-body-md italic text-on-surface-variant/80"}>{line.translation}</p>
            {allowTranslationSuggestion && <TranslationSuggestionButton videoId={videoId} promptVersion={promptVersion} lineIndex={line.index} currentTranslation={line.translation} onPauseSong={onPauseSong} />}
          </div>
        )}
      </div>
      {onShare && (
        <button
          type="button" aria-label={`Chia sẻ câu ${line.index + 1} thành ảnh`} title="Chia sẻ câu này"
          onClick={(e) => { e.stopPropagation(); onShare(line.index); }}
          className="ml-auto mt-0.5 flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-on-surface-variant opacity-0 transition-opacity hover:bg-surface-container-high focus-visible:opacity-100 group-hover/line:opacity-100 [@media(hover:none)]:opacity-60"
        >
          <Icon name="share" size={18} />
        </button>
      )}
    </li>
  );
}

export const LyricLineRow = memo(LyricLineRowImpl);
