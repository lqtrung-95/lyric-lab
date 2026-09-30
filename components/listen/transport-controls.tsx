"use client";

import { Icon } from "@/components/ui/icon";
import { formatTimestamp } from "@/lib/preview/preview-format";
import type { RepeatConfig } from "@/lib/listen/repeat-config";
import { PLAYBACK_RATES } from "@/lib/user-state/listen-prefs";
import { RepeatConfigChips } from "./repeat-config-chips";

interface TransportControlsProps {
  ready: boolean;
  playing: boolean;
  onTogglePlay: () => void;
  onSeekBy: (deltaSec: number) => void;
  loopIndex: number | null;
  loopStart: number | null;
  onToggleLoop: () => void;
  rate: number;
  onRate: (rate: number) => void;
  /** Ghim: tắt tự cuộn theo câu đang hát để đọc chỗ khác mà không bị kéo về. */
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  repeatConfig: RepeatConfig;
  onRepeatConfigChange: (v: RepeatConfig) => void;
  /** Giải thích câu đang hát bằng AI (nghĩa tự nhiên hơn bản dịch máy, kèm ghi chú ngữ pháp). */
  onExplain: () => void;
  explainDisabled: boolean;
}

const roundBtn = "flex h-11 w-11 items-center justify-center rounded-full bg-surface-container text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50";

/** Thanh điều khiển: lùi/tới 5 giây, phát/dừng, lặp câu (LS-08, kèm cấu hình số lần/khoảng nghỉ), tốc độ 0,5x / 0,75x / 1x (LS-09), ghim tự cuộn. */
export function TransportControls({ ready, playing, onTogglePlay, onSeekBy, loopIndex, loopStart, onToggleLoop, rate, onRate, autoScroll, onToggleAutoScroll, repeatConfig, onRepeatConfigChange, onExplain, explainDisabled }: TransportControlsProps) {
  const looping = loopIndex !== null;
  const pinned = !autoScroll;

  return (
    <div className="relative flex flex-wrap items-center justify-between gap-4 rounded-xl bg-surface-container-low p-4 shadow-sm">
      {looping && <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} className="absolute -top-3 right-3 z-10" />}
      <div className="flex items-center gap-3">
        <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} title="Lùi 5 giây" aria-label="Lùi 5 giây" className={roundBtn}>
          <Icon name="replay_5" size={20} />
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={onTogglePlay}
          aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container shadow-md transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50"
        >
          <Icon name={playing ? "pause" : "play_arrow"} filled size={26} />
        </button>
        <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} title="Tới 5 giây" aria-label="Tới 5 giây" className={roundBtn}>
          <Icon name="forward_5" size={20} />
        </button>
        <button
          type="button"
          disabled={!ready}
          onClick={onToggleLoop}
          aria-pressed={looping}
          aria-label="Lặp câu đang hát"
          title="Lặp câu đang hát (L)"
          className={`${roundBtn} ${looping ? "!bg-primary/15 text-primary" : "text-on-surface-variant"}`}
        >
          <Icon name="repeat_one" size={20} />
        </button>
        <button
          type="button"
          onClick={onToggleAutoScroll}
          aria-pressed={pinned}
          aria-label={pinned ? "Bỏ ghim, tự cuộn theo câu đang hát" : "Ghim, không tự cuộn theo câu đang hát"}
          title={pinned ? "Đã ghim: bỏ ghim để tự cuộn lại" : "Ghim để đọc câu khác mà không bị cuộn theo"}
          className={`${roundBtn} ${pinned ? "!bg-primary/15 text-primary" : "text-on-surface-variant"}`}
        >
          <Icon name="push_pin" size={20} />
        </button>
        <button
          type="button"
          disabled={explainDisabled}
          onClick={onExplain}
          aria-label="Giải thích câu đang hát bằng AI"
          title="Giải thích câu đang hát"
          className={roundBtn}
        >
          <Icon name="auto_awesome" size={20} />
        </button>
      </div>

      {looping && (
        <div role="status" className="flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5 text-label-sm font-semibold text-primary">
          <span aria-hidden="true" className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-primary" />
          <span className="whitespace-nowrap">Đang lặp câu {loopIndex + 1}{loopStart !== null && ` (${formatTimestamp(loopStart)})`}</span>
        </div>
      )}

      <div role="group" aria-label="Tốc độ phát" className="flex items-center gap-2">
        <span className="text-label-sm text-on-surface-variant">Tốc độ:</span>
        {PLAYBACK_RATES.map((r) => (
          <button
            key={r}
            type="button"
            aria-pressed={r === rate}
            onClick={() => onRate(r)}
            className={`min-h-11 min-w-11 rounded-full px-3 text-label-sm font-semibold ${r === rate ? "bg-primary text-on-primary" : "bg-surface-container-highest text-on-surface"}`}
          >
            {r === 1 ? "1x" : `${String(r).replace(".", ",")}x`}
          </button>
        ))}
      </div>
    </div>
  );
}
