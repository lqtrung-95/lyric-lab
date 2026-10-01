"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { PlayerController } from "@/components/player/use-youtube-player";
import type { RepeatConfig } from "@/lib/listen/repeat-config";
import { PLAYBACK_RATES } from "@/lib/user-state/listen-prefs";
import { LyricOffsetPopover } from "./lyric-offset-popover";
import { PlaybackProgressBar } from "./playback-progress-bar";
import { RepeatConfigChips } from "./repeat-config-chips";

interface MobilePlaybackBarProps {
  controller: PlayerController | null;
  durationSec: number;
  playing: boolean;
  onTogglePlay: () => void;
  onSeekBy: (deltaSec: number) => void;
  looping: boolean;
  onToggleLoop: () => void;
  rate: number;
  onRate: (rate: number) => void;
  /** Độ lệch lời hiện tại (giây) và hàm chỉnh, để canh lời ngay trên thanh này. */
  offset: number;
  onOffsetChange: (offset: number) => void;
  /** Ghim: tắt tự cuộn theo câu đang hát để đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  repeatConfig: RepeatConfig;
  onRepeatConfigChange: (v: RepeatConfig) => void;
  /** Giải thích câu đang hát bằng AI (nghĩa tự nhiên hơn bản dịch máy, kèm ghi chú ngữ pháp). */
  onExplain: () => void;
  explainDisabled: boolean;
  /** Mở popup luyện phát âm riêng cho câu đang hát (Nghe → Nghĩ → Hát → Nghe lại), giống nút của app Miraa. */
  onPractice: () => void;
  practiceDisabled: boolean;
}

const tile = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50";

/**
 * Thanh điều khiển điện thoại, gắn ngay dưới video. 2 hàng: hàng trên là vị trí phát (kéo tới đâu tuỳ ý, kèm ±5s
 * cạnh hai mốc thời gian — xem `PlaybackProgressBar`), hàng dưới là các nút bấm nhanh (ghim, giải thích, lặp câu,
 * tốc độ, canh lời lệch, phát/dừng). Nút luyện phát âm tách riêng bên phải, cao bằng cả 2 hàng — thao tác luyện
 * phát âm là trọng tâm của màn Nghe nên đặt nổi bật nhất, không lẫn vào hàng nút phụ.
 */
export function MobilePlaybackBar({ controller, durationSec, playing, onTogglePlay, onSeekBy, looping, onToggleLoop, rate, onRate, offset, onOffsetChange, autoScroll, onToggleAutoScroll, repeatConfig, onRepeatConfigChange, onExplain, explainDisabled, onPractice, practiceDisabled }: MobilePlaybackBarProps) {
  const [syncOpen, setSyncOpen] = useState(false);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!syncOpen) return;
    const onDown = (e: PointerEvent) => { if (!barRef.current?.contains(e.target as Node)) setSyncOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setSyncOpen(false); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [syncOpen]);

  const ready = !!controller;
  const nextRate = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate as never) + 1) % PLAYBACK_RATES.length];
  const label = (r: number) => (r === 1 ? "1x" : `${String(r).replace(".", ",")}x`);
  const rateLabel = `Tốc độ ${label(rate)}, bấm để đổi sang ${label(nextRate)}`;
  const pinned = !autoScroll;
  const pinLabel = pinned ? "Bỏ ghim, tự cuộn theo câu đang hát" : "Ghim, không tự cuộn theo câu đang hát";
  const offsetLabel = `Canh lời lệch (đang lệch ${Number(offset.toFixed(2))} giây)`;

  return (
    // `relative` ở khung ngoài cùng (trọn bề rộng thanh, kể cả nút Luyện) để popup canh lời neo theo mép phải màn
    // hình thật — neo theo khung hẹp hơn (chỉ cột trái) sẽ bị đẩy lệch trái, tràn ra ngoài màn hình hẹp.
    <div ref={barRef} className="relative bg-surface">
      {looping && (
        <div className="flex justify-end border-b border-outline-variant/30 px-2 py-1.5">
          <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} />
        </div>
      )}
      <div className="flex items-stretch gap-2 px-2 py-2">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <PlaybackProgressBar controller={controller} durationSec={durationSec} onSeekBy={onSeekBy} />
          <div role="group" aria-label="Điều khiển nhanh" className="flex items-center justify-between gap-1">
            <button type="button" onClick={onToggleAutoScroll} aria-pressed={pinned} aria-label={pinLabel} className={`${tile} ${pinned ? "!bg-primary/15 text-primary" : ""}`}><Icon name="push_pin" size={20} /></button>
            <button type="button" disabled={explainDisabled} onClick={onExplain} aria-label="Giải thích câu đang hát bằng AI" className={tile}><Icon name="auto_awesome" size={20} /></button>
            <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát" className={`${tile} ${looping ? "!bg-primary/15 text-primary" : ""}`}><Icon name="repeat_one" size={20} /></button>
            <button type="button" onClick={() => onRate(nextRate)} aria-label={rateLabel} className={`${tile} text-label-sm font-semibold`}>{label(rate)}</button>
            <button type="button" onClick={() => setSyncOpen((o) => !o)} aria-expanded={syncOpen} aria-label={offsetLabel} className={`${tile} ${syncOpen || offset !== 0 ? "!bg-primary/15 text-primary" : ""}`}><Icon name="tune" size={20} /></button>
            <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50">
              <Icon name={playing ? "pause" : "play_arrow"} filled size={22} />
            </button>
          </div>
        </div>
        <button
          type="button" disabled={practiceDisabled} onClick={onPractice} aria-label="Luyện phát âm câu đang hát"
          className="flex w-16 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-primary-container text-on-primary-container transition-colors hover:bg-primary hover:text-on-primary disabled:opacity-50"
        >
          <Icon name="mic" size={24} />
          <span className="text-label-sm font-medium">Luyện</span>
        </button>
      </div>
      {syncOpen && <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="absolute right-2 bottom-full z-40 mb-1" />}
    </div>
  );
}
