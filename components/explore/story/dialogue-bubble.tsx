"use client";

import { useEffect, useRef } from "react";
import { PronounceButton } from "@/components/ui/pronounce-button";
import { RubyLine } from "@/components/ui/ruby-text";
import type { ClueDef, DialogueChoice, DialogueNode, Speaker } from "@/lib/explore/story/story-types";
import { FLAT_SPRITES } from "../art/flat/flat-sprites";
import { HintToggles } from "./hint-toggles";
import type { Hints } from "./use-story-hints";

/** Vị trí người nói trong khung cảnh: (x, y) là giữa-đáy theo %, `w` là chiều rộng %, `sprite` để suy ra chiều cao. */
export interface BubbleAnchor { x: number; y: number; w: number; sprite: string }

interface Props {
  node: DialogueNode;
  choices: DialogueChoice[];
  speaker: Speaker | undefined;
  anchor: BubbleAnchor;
  pinyin: Record<string, string>;
  hints: Hints;
  onToggleHint: (k: keyof Hints) => void;
  newClues: ClueDef[];
  onChoose: (index: number | null) => void;
  onClose: () => void;
}

/** Bong bóng giữ màu sáng cố định (như tranh trong cảnh, không đổi theo chế độ tối). */
const INK = "#4a2e1b";
const BUBBLE_WIDTH = 64; // % khung cảnh
const MARGIN = 2; // % khoảng hở tới khung và tới đầu nhân vật

/** Chiều cao nhân vật theo % chiều cao khung (khung 4:3). */
const heightPct = (a: BubbleAnchor): number => {
  const s = FLAT_SPRITES[a.sprite];
  return s ? a.w * (s.h / s.w) * (4 / 3) : 14;
};

/**
 * Câu thoại dạng bong bóng chat nằm trong khung cảnh, ngay trên đầu người đang nói, đuôi bong bóng chỉ xuống nhân vật (không che nhân vật).
 * Lời của bạn (lựa chọn) hiện ở bong bóng trên đầu Gấu Trúc. Phím di chuyển của cảnh không lọt vào đây (đã chặn), Esc để đóng.
 */
export function DialogueBubble({ node, choices, speaker, anchor, pinyin, hints, onToggleHint, newClues, onChoose, onClose }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const top = anchor.y - heightPct(anchor) - MARGIN; // mép dưới bong bóng (% từ trên khung)
  const left = Math.min(100 - MARGIN - BUBBLE_WIDTH, Math.max(MARGIN, anchor.x - BUBBLE_WIDTH / 2));
  const tail = Math.min(90, Math.max(10, ((anchor.x - left) / BUBBLE_WIDTH) * 100));

  // Mỗi câu mới: chuyển focus vào nút hành động đầu tiên để nhấn Enter/Space là đi tiếp.
  useEffect(() => { rootRef.current?.querySelector<HTMLButtonElement>("[data-primary]")?.focus({ preventScroll: true }); }, [node.id]);

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-label={`Hội thoại: ${speaker?.name ?? node.speaker}`}
      onKeyDown={(e) => { e.stopPropagation(); if (e.key === "Escape") onClose(); }}
      onKeyUp={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      className="absolute"
      style={{ left: `${left}%`, bottom: `${100 - top}%`, width: `${BUBBLE_WIDTH}%`, maxHeight: `${Math.max(30, top - 1)}%`, zIndex: 2000, display: "flex", flexDirection: "column" }}
    >
      <div className="flex min-h-0 flex-col overflow-y-auto rounded-[22px] border-[3px] px-3.5 py-3 text-[13px] leading-snug shadow-[0_4px_0_rgba(74,46,27,0.28)] sm:text-sm" style={{ background: "#fffaf0", borderColor: INK, color: INK }}>
        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
          <p className="text-[12px] font-extrabold" style={{ color: "#b4531a" }}>{speaker?.name ?? node.speaker}</p>
          <div className="[&_button]:!min-h-8 [&_button]:!px-2.5 [&_button]:!text-[12px]"><HintToggles hints={hints} onToggle={onToggleHint} /></div>
        </div>
        {node.zh ? (
          <>
            <div className="mt-0.5 flex items-center gap-2">
              <p lang="zh-Hans" className={`min-w-0 flex-1 text-lg font-bold sm:text-xl ${hints.pinyin ? "leading-[2.2]" : "leading-snug"}`}><RubyLine zh={node.zh} pinyin={pinyin[node.zh]} show={hints.pinyin} rtClassName="[&_rt]:text-[#b4531a]" fallbackClassName="text-[#b4531a]" /></p>
              <PronounceButton text={node.zh} className="!size-9 !bg-[#f6e6c4] !text-[#b4531a] hover:!bg-[#efd9a8]" />
            </div>
            {hints.vi && <p className={`text-[13px] opacity-80 ${hints.pinyin ? "mt-1.5" : ""}`}>{node.vi}</p>}
          </>
        ) : <p className="mt-0.5 italic">{node.vi}</p>}
        {newClues.map((c) => <p key={c.id} role="status" className="mt-2 rounded-lg px-2 py-1 text-[12px] font-extrabold" style={{ background: "#d9f0c8", color: "#2f5a22" }}>Manh mối mới: {c.title}</p>)}
        <div className="mt-2 flex flex-col gap-1.5">
          {choices.length > 0 ? choices.map((c, i) => (
            <button
              key={i}
              type="button"
              data-primary={i === 0 ? "" : undefined}
              onClick={() => onChoose(i)}
              className="flex min-h-10 w-full flex-col items-start rounded-xl border-2 px-2.5 py-1.5 text-left transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{ borderColor: INK, background: "#fff1d3" }}
            >
              <span lang="zh-Hans" className={`text-[15px] font-bold ${hints.pinyin ? "leading-[2.2]" : ""}`}><RubyLine zh={c.zh} pinyin={pinyin[c.zh]} show={hints.pinyin} rtClassName="[&_rt]:text-[#b4531a]" fallbackClassName="text-[#b4531a]" /></span>
              {hints.vi && <span className={`text-[12px] opacity-80 ${hints.pinyin ? "mt-1" : ""}`}>{c.vi}</span>}
            </button>
          )) : (
            <button type="button" data-primary onClick={() => onChoose(null)} className="min-h-10 self-end rounded-full border-2 px-5 text-[13px] font-extrabold transition-colors hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2" style={{ borderColor: INK, background: "#bcf1a9", color: "#1f4a17" }}>
              {node.next ? "Tiếp ▸" : "Đóng"}
            </button>
          )}
        </div>
      </div>
      {/* Đuôi bong bóng chỉ xuống người nói (nằm ngoài vùng cuộn để không sinh thanh cuộn). */}
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-[11px] h-[18px] w-[18px] rotate-45 border-b-[3px] border-r-[3px]" style={{ left: `calc(${tail}% - 9px)`, background: "#fffaf0", borderColor: INK }} />
    </div>
  );
}
