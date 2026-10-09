"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { PlayerController } from "@/components/player/use-youtube-player";
import type { RepeatConfig } from "@/lib/listen/repeat-config";
import { formatTimestamp } from "@/lib/preview/preview-format";
import { formatRate } from "@/lib/user-state/listen-prefs";
import { LyricOffsetPopover } from "./lyric-offset-popover";
import { PlaybackProgressBar } from "./playback-progress-bar";
import { PlaybackRatePopover } from "./playback-rate-popover";
import { RepeatConfigChips } from "./repeat-config-chips";

interface PlaybackBarProps {
  controller: PlayerController | null;
  durationSec: number;
  playing: boolean;
  onTogglePlay: () => void;
  onSeekBy: (deltaSec: number) => void;
  loopIndex: number | null;
  loopStart: number | null;
  onToggleLoop: () => void;
  rate: number;
  onRate: (rate: number) => void;
  /** Độ lệch lời hiện tại (giây) và hàm chỉnh, để canh lời ngay trên thanh này. */
  offset?: number;
  onOffsetChange?: (offset: number) => void;
  /** Ghim: tắt tự cuộn theo câu đang hát để đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  repeatConfig: RepeatConfig;
  onRepeatConfigChange: (v: RepeatConfig) => void;
  /** Giải thích câu đang hát bằng AI (nghĩa tự nhiên hơn bản dịch máy, kèm ghi chú ngữ pháp). */
  onExplain?: () => void;
  explainDisabled?: boolean;
  /** Mở popup luyện phát âm riêng cho câu đang hát (Nghe → Nghĩ → Hát → Nghe lại), giống nút của app Miraa. */
  onPractice?: () => void;
  practiceDisabled?: boolean;
}

const tile = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50 lg:h-14 lg:w-14";
const iconSize = "text-[20px] lg:text-[26px]";

/**
 * Thanh điều khiển, gắn ngay dưới video (dính theo video khi cuộn, cùng một bố cục cho mọi cỡ màn hình — điện
 * thoại, tablet, máy tính). 2 hàng: hàng trên là vị trí phát (kéo tới đâu tuỳ ý, kèm ±5s cạnh hai mốc thời gian —
 * xem `PlaybackProgressBar`), hàng dưới là các nút bấm nhanh: tốc độ, lặp câu, ghim, phát/dừng, giải thích AI,
 * luyện phát âm, canh lời lệch.
 */
export function PlaybackBar({ controller, durationSec, playing, onTogglePlay, onSeekBy, loopIndex, loopStart, onToggleLoop, rate, onRate, offset = 0, onOffsetChange, autoScroll, onToggleAutoScroll, repeatConfig, onRepeatConfigChange, onExplain, explainDisabled, onPractice, practiceDisabled }: PlaybackBarProps) {
  // Bảng nhỏ đang mở trên thanh: canh lời lệch hoặc chỉnh tốc độ (chỉ mở một bảng một lúc).
  const [panel, setPanel] = useState<"sync" | "rate" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!panel) return;
    const onDown = (e: PointerEvent) => { if (!barRef.current?.contains(e.target as Node)) setPanel(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setPanel(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [panel]);

  const ready = !!controller;
  const looping = loopIndex !== null;
  const rateLabel = `Tốc độ ${formatRate(rate)}, bấm để chỉnh`;
  const pinned = !autoScroll;
  const pinLabel = pinned ? "Bỏ ghim, tự cuộn theo câu đang hát" : "Ghim, không tự cuộn theo câu đang hát";
  const offsetLabel = `Canh lời lệch (đang lệch ${Number(offset.toFixed(2))} giây)`;

  return (
    // `relative` ở khung ngoài cùng (trọn bề rộng thanh) để popup canh lời neo theo mép phải thật — neo theo khung
    // hẹp hơn sẽ bị đẩy lệch trái, tràn ra ngoài màn hình hẹp.
    <div ref={barRef} className="relative bg-surface">
      {looping && (
        <div className="flex items-center justify-between gap-2 border-b border-outline-variant/30 px-2 py-1.5">
          <p role="status" className="flex items-center gap-1.5 text-label-sm font-semibold text-primary">
            <span aria-hidden="true" className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
            <span className="whitespace-nowrap">Đang lặp câu {loopIndex + 1}{loopStart !== null && ` (${formatTimestamp(loopStart)})`}</span>
          </p>
          <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} />
        </div>
      )}
      <div className="flex flex-col gap-1 px-2 py-2">
        <PlaybackProgressBar controller={controller} durationSec={durationSec} onSeekBy={onSeekBy} />
        <div role="group" aria-label="Điều khiển nhanh" className="flex items-center justify-between gap-1">
          <button type="button" data-tour="rate" onClick={() => setPanel((p) => (p === "rate" ? null : "rate"))} aria-expanded={panel === "rate"} aria-label={rateLabel} className={`${tile} text-label-sm font-semibold lg:text-[15px] ${panel === "rate" || rate !== 1 ? "!bg-primary/15 text-primary" : ""}`}>{formatRate(rate)}</button>
          <button type="button" disabled={!ready} data-tour="loop" onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát" className={`${tile} ${looping ? "!bg-primary/15 text-primary" : ""}`}><Icon name="repeat_one" size={null} className={iconSize} /></button>
          <button type="button" data-tour="pin" onClick={onToggleAutoScroll} aria-pressed={pinned} aria-label={pinLabel} className={`${tile} ${pinned ? "!bg-primary/15 text-primary" : ""}`}><Icon name="push_pin" size={null} className={iconSize} /></button>
          <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50 lg:h-14 lg:w-14">
            <Icon name={playing ? "pause" : "play_arrow"} filled size={null} className="text-[22px] lg:text-[28px]" />
          </button>
          {onExplain && <button type="button" disabled={explainDisabled} data-tour="explain" onClick={onExplain} aria-label="Giải thích câu đang hát bằng AI" className={tile}><Icon name="auto_awesome" size={null} className={iconSize} /></button>}
          {onPractice && <button type="button" disabled={practiceDisabled} data-tour="practice" onClick={onPractice} aria-label="Luyện phát âm câu đang hát" className={tile}><Icon name="mic" size={null} className={iconSize} /></button>}
          {onOffsetChange && <button type="button" data-tour="offset" onClick={() => setPanel((p) => (p === "sync" ? null : "sync"))} aria-expanded={panel === "sync"} aria-label={offsetLabel} className={`${tile} ${panel === "sync" || offset !== 0 ? "!bg-primary/15 text-primary" : ""}`}><Icon name="tune" size={null} className={iconSize} /></button>}
        </div>
      </div>
      {panel === "sync" && onOffsetChange && <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="absolute right-2 bottom-full z-40 mb-1" />}
      {panel === "rate" && <PlaybackRatePopover rate={rate} onChange={onRate} className="absolute left-2 bottom-full z-40 mb-1" />}
    </div>
  );
}
