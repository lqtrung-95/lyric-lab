"use client";

import { useEffect, useMemo, useRef } from "react";
import type { AnalyzedLine, PreviewItem } from "@/lib/analysis/analysis-types";
import { Icon } from "@/components/ui/icon";
import { LyricLineRow, type LineState, type WordSelection } from "./lyric-line-row";
import { ViewToggles } from "./view-toggles";

// Sau khi người dùng tự cuộn, tạm ngừng tự cuộn theo lời để không giật màn hình.
const MANUAL_SCROLL_PAUSE_MS = 4000;

interface LyricListProps {
  videoId: string;
  promptVersion: string;
  lines: AnalyzedLine[];
  currentIndex: number;
  vocab: PreviewItem[];
  grammar: PreviewItem[];
  showPinyin: boolean;
  showTranslation: boolean;
  /** Tự cuộn theo câu đang hát. Tắt (ghim) khi người dùng muốn đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  onTogglePinyin: () => void;
  onToggleTranslation: () => void;
  onSeek: (index: number) => void;
  onWord: (word: WordSelection) => void;
}

/** Danh sách lời chạy theo nhạc: câu đang hát nằm giữa màn hình (LS-02), các câu qua rồi mờ đi. */
export function LyricList({ videoId, promptVersion, lines, currentIndex, vocab, grammar, showPinyin, showTranslation, autoScroll, onTogglePinyin, onToggleTranslation, onSeek, onWord }: LyricListProps) {
  const listRef = useRef<HTMLOListElement>(null);
  const lastManualScroll = useRef(0);

  const vocabIds = useMemo(() => new Set(vocab.map((v) => v.id)), [vocab]);
  // Ngữ pháp của từng dòng (id + vị trí ký tự), tính một lần thay vì mỗi lần vẽ.
  const grammarByLine = useMemo(() => {
    const byLine = new Map<number, { id: string; ranges: [number, number][] }[]>();
    for (const g of grammar) {
      for (const o of g.occurrences) {
        if (o.ranges?.length) byLine.set(o.lineIndex, [...(byLine.get(o.lineIndex) ?? []), { id: g.id, ranges: o.ranges }]);
      }
    }
    return byLine;
  }, [grammar]);

  // Đối tượng tô sáng ổn định theo dòng để LyricLineRow (memo) không vẽ lại mỗi 100 ms.
  const highlightsByLine = useMemo(
    () => new Map(lines.map((l) => [l.index, { vocabIds, grammar: grammarByLine.get(l.index) ?? [] }])),
    [lines, vocabIds, grammarByLine],
  );

  useEffect(() => {
    const mark = () => { lastManualScroll.current = Date.now(); };
    const el = listRef.current;
    window.addEventListener("wheel", mark, { passive: true });
    window.addEventListener("touchmove", mark, { passive: true });
    // Bấm một câu/từ cũng là tương tác thủ công: nếu không tính, bài đang phát có thể kích hoạt tự cuộn
    // về câu đang hát ngay sau cú bấm, làm màn hình giật ngay khi người dùng đang tra một câu đã qua.
    el?.addEventListener("pointerdown", mark, { passive: true });
    return () => {
      window.removeEventListener("wheel", mark);
      window.removeEventListener("touchmove", mark);
      el?.removeEventListener("pointerdown", mark);
    };
  }, []);

  useEffect(() => {
    if (!autoScroll || currentIndex < 0 || Date.now() - lastManualScroll.current < MANUAL_SCROLL_PAUSE_MS) return;
    const el = listRef.current?.querySelector<HTMLElement>(`[data-line-index="${currentIndex}"]`);
    if (!el) return;
    // Đưa câu về giữa phần màn hình còn trống bên dưới khối video + thanh điều khiển dính ở trên.
    const stickyBottom = document.querySelector("[data-sticky-player]")?.getBoundingClientRect().bottom ?? 64;
    const target = stickyBottom + (window.innerHeight - stickyBottom) / 2;
    const rect = el.getBoundingClientRect();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollBy({ top: rect.top + rect.height / 2 - target, behavior: reduce ? "auto" : "smooth" });
  }, [currentIndex, autoScroll]);

  return (
    <div className="flex flex-col gap-4 rounded-xl bg-surface-container-lowest p-4 shadow-sm md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-serif text-headline-md text-on-surface">
          <Icon name="format_quote" size={20} className="text-primary" />
          Lời ca & nhịp điệu
        </h2>
        <p className="text-label-sm text-on-surface-variant">Bấm câu để nhảy tới đó · bấm từ để tra</p>
        <ViewToggles
          className="flex md:hidden"
          showPinyin={showPinyin} showTranslation={showTranslation}
          onTogglePinyin={onTogglePinyin} onToggleTranslation={onToggleTranslation}
        />
      </div>
      <ol ref={listRef} className="flex flex-col gap-2">
        {lines.map((line) => {
          const state: LineState = line.index === currentIndex ? "active" : line.index < currentIndex ? "past" : "upcoming";
          return (
            <LyricLineRow
              key={line.index}
              videoId={videoId}
              promptVersion={promptVersion}
              line={line}
              state={state}
              showPinyin={showPinyin}
              showTranslation={showTranslation}
              highlights={highlightsByLine.get(line.index)!}
              onSeek={onSeek}
              onWord={onWord}
            />
          );
        })}
      </ol>
    </div>
  );
}
