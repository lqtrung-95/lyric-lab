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
  /** Có thì hiện nút báo bản dịch của câu này là sai (video luyện nghe: AI dịch lại ngay câu đó). */
  onReportTranslation?: (index: number) => void;
  /** Có thì hiện nút sửa lời (chỉ quản trị viên). */
  onEdit?: (index: number) => void;
}

/**
 * Một dòng lời. Từ vựng được tô nền + đậm (kèm nhãn ẩn cho trình đọc màn hình), ngữ pháp được gạch chân:
 * hai kiểu khác nhau về hình dạng chứ không chỉ về màu (LS-04). Bấm dòng để nhảy tới đó (LS-07).
 */
function LyricLineRowImpl({ videoId, promptVersion, line, state, showPinyin, showTranslation, highlights, onSeek, onWord, onPauseSong, allowTranslationSuggestion = true, onShare, onReportTranslation, onEdit }: LyricLineRowProps) {
  const active = state === "active";
  const groups = buildLineSegments(line, highlights);
  // Nút của dòng nằm ở cột biểu tượng bên phải. Máy tính: hiện khi rê chuột. Điện thoại: chỉ ở câu đang hát (để không bóp hẹp các dòng còn lại)
  // và xếp dọc khi có cả nút sửa của quản trị, nên cột luôn rộng đúng một nút.
  const iconButton = "flex h-11 w-11 cursor-pointer items-center justify-center rounded-full text-on-surface-variant hover:bg-surface-container-high";
  const canReport = Boolean(onReportTranslation && line.translation);
  const hasActions = Boolean(onShare || onEdit || canReport);

  return (
    <li
      data-line-index={line.index}
      aria-current={active ? "true" : undefined}
      onClick={() => onSeek(line.index)}
      className={`group/line relative flex cursor-pointer items-start gap-2 rounded-xl p-2.5 transition-colors md:gap-3 md:p-3.5 ${
        active ? "bg-surface-container p-3 shadow-md md:p-5" : state === "past" ? "opacity-60 hover:bg-surface-container-low/50" : "hover:bg-surface-container-low/50"
      }`}
    >
      {active && <div aria-hidden="true" className="absolute -left-1 bottom-4 top-4 w-2 rounded-full bg-primary" />}
      <button
        type="button"
        aria-label={`Phát từ câu ${line.index + 1}`}
        onClick={(e) => { e.stopPropagation(); onSeek(line.index); }}
        className={`-mr-5 mt-0.5 min-h-11 w-11 shrink-0 cursor-pointer text-left text-label-sm md:mr-0 ${active ? "font-bold text-primary" : "text-on-surface-variant"}`}
      >
        {String(line.index + 1).padStart(2, "0")}
      </button>
      <div className="flex min-w-0 flex-1 flex-col gap-0.5 md:gap-2">
        <p className={`flex flex-wrap items-end gap-x-0.5 gap-y-2 font-serif md:gap-y-4 ${active ? "text-[22px] leading-[30px] md:text-headline-lg" : "text-[19px] leading-7 md:text-hanzi-body"} text-on-surface`}>
          {groups.map((g) => {
            const pinyinClass = `text-[11px] leading-[14px] md:text-pinyin-reading font-sans ${active ? "text-on-surface" : "text-on-surface-variant"}`;
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
                    ? "mx-0 inline-flex cursor-pointer items-center gap-1.5 rounded-md bg-primary/15 px-1 py-0.5 font-bold text-primary ring-2 ring-primary/20 md:mx-0.5 md:px-2"
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
            <p className={active ? "text-[15px] font-medium leading-6 text-primary md:text-body-lg" : "text-[13px] italic leading-5 text-on-surface-variant/80 md:text-body-md"}>{line.translation}</p>
            {allowTranslationSuggestion && <TranslationSuggestionButton videoId={videoId} promptVersion={promptVersion} lineIndex={line.index} currentTranslation={line.translation} onPauseSong={onPauseSong} />}
          </div>
        )}
      </div>
      {hasActions && (
        <div className={`-mr-3 ml-auto mt-0.5 shrink-0 flex-col md:mr-0 md:flex md:flex-row md:opacity-0 md:transition-opacity md:focus-within:opacity-100 md:group-hover/line:opacity-100 md:[@media(hover:none)]:opacity-60 ${active ? "flex" : "hidden"}`}>
          {onShare && (
            <button type="button" aria-label={`Chia sẻ câu ${line.index + 1} thành ảnh`} title="Chia sẻ câu này" onClick={(e) => { e.stopPropagation(); onShare(line.index); }} className={iconButton}>
              <Icon name="share" size={18} />
            </button>
          )}
          {canReport && (
            <button type="button" aria-label={`Báo bản dịch câu ${line.index + 1} sai`} title="Báo bản dịch sai" onClick={(e) => { e.stopPropagation(); onReportTranslation!(line.index); }} className={iconButton}>
              <Icon name="flag" size={18} />
            </button>
          )}
          {onEdit && (
            <button type="button" aria-label={`Sửa lời câu ${line.index + 1} (quản trị)`} title="Sửa lời (quản trị)" onClick={(e) => { e.stopPropagation(); onEdit(line.index); }} className={iconButton}>
              <Icon name="edit" size={18} />
            </button>
          )}
        </div>
      )}
    </li>
  );
}

export const LyricLineRow = memo(LyricLineRowImpl);
