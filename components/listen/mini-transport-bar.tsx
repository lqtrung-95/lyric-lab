"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { RepeatConfig } from "@/lib/listen/repeat-config";
import { LyricOffsetPopover } from "./lyric-offset-popover";
import { RepeatConfigChips } from "./repeat-config-chips";
import { PLAYBACK_RATES } from "@/lib/user-state/listen-prefs";

interface MiniTransportBarProps {
  ready: boolean;
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
}

const round = "flex h-11 w-11 items-center justify-center rounded-full text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/15 disabled:opacity-50";
// Kiểu "gắn dưới video" (điện thoại): nút có chữ nhỏ bên dưới để người dùng biết nút làm gì.
const tile = "flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 text-on-surface transition-colors hover:bg-surface-container-high disabled:opacity-50";
const caption = "text-[11px] font-medium leading-none text-on-surface-variant";

/**
 * Thanh điều khiển thu gọn. `inline`: hàng nút có chữ, gắn ngay dưới video ghim ở đầu màn hình (điện thoại), luôn hiện.
 * Mặc định: viên thuốc nổi ở đáy cột (máy tính), chỉ hiện khi thanh điều khiển đầy đủ đã cuộn khuất (`visible`).
 * Cả hai có nút chỉnh thời gian hiện lời để canh lời ngay khi đang nghe, và 2 chip chỉnh nhanh số lần/khoảng nghỉ
 * hiện khi đang lặp câu (không chiếm thêm chỗ trong hàng nút chính). Bản inline sát video nên chip nằm trong luồng
 * (hàng riêng phía trên hàng nút) để không đè lên player; bản viên thuốc nổi (đã tách xa video khi cuộn) thì chip
 * nổi hẳn lên trên, giống thanh điều khiển nổi của ứng dụng tham khảo.
 */
export function MiniTransportBar({ visible, inline = false, ready, playing, onTogglePlay, onSeekBy, looping, onToggleLoop, rate, onRate, offset, onOffsetChange, autoScroll, onToggleAutoScroll, repeatConfig, onRepeatConfigChange, onExplain, explainDisabled }: MiniTransportBarProps & { visible: boolean; inline?: boolean }) {
  const [openPanel, setOpenPanel] = useState<"sync" | null>(null);
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!openPanel) return;
    const onDown = (e: PointerEvent) => { if (!barRef.current?.contains(e.target as Node)) setOpenPanel(null); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenPanel(null); };
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("pointerdown", onDown); document.removeEventListener("keydown", onKey); };
  }, [openPanel]);
  if (!visible && !inline) return null;
  const nextRate = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate as never) + 1) % PLAYBACK_RATES.length];
  const label = (r: number) => (r === 1 ? "1x" : `${String(r).replace(".", ",")}x`);
  const rateLabel = `Tốc độ ${label(rate)}, bấm để đổi sang ${label(nextRate)}`;
  const offsetLabel = `Chỉnh thời gian hiện lời (đang lệch ${Number(offset.toFixed(2))} giây)`;
  const pinned = !autoScroll;
  const pinLabel = pinned ? "Bỏ ghim, tự cuộn theo câu đang hát" : "Ghim, không tự cuộn theo câu đang hát";

  if (inline) {
    return (
      <div ref={barRef} className="bg-surface">
        {looping && (
          <div className="flex justify-center border-b border-outline-variant/30 py-1.5">
            <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} />
          </div>
        )}
        <div role="group" aria-label="Điều khiển nhanh" className="relative flex items-stretch gap-0.5 px-1 py-1">
          <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={tile}><Icon name="replay_5" size={24} /><span aria-hidden="true" className={caption}>Lùi 5s</span></button>
          <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"} className={tile}>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-on-primary"><Icon name={playing ? "pause" : "play_arrow"} filled size={22} /></span>
            <span aria-hidden="true" className={caption}>{playing ? "Dừng" : "Phát"}</span>
          </button>
          <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={tile}><Icon name="forward_5" size={24} /><span aria-hidden="true" className={caption}>Tới 5s</span></button>
          <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát" className={`${tile} ${looping ? "bg-primary/15 text-primary" : ""}`}><Icon name="repeat_one" size={24} /><span aria-hidden="true" className={caption}>Lặp câu</span></button>
          <button type="button" onClick={() => onRate(nextRate)} aria-label={rateLabel} className={tile}><span className="font-semibold">{label(rate)}</span><span aria-hidden="true" className={caption}>Tốc độ</span></button>
          <button type="button" onClick={() => setOpenPanel((p) => (p === "sync" ? null : "sync"))} aria-expanded={openPanel === "sync"} aria-label={offsetLabel} className={`${tile} ${openPanel === "sync" || offset !== 0 ? "bg-primary/15 text-primary" : ""}`}><Icon name="tune" size={24} /><span aria-hidden="true" className={caption}>Chỉnh lời</span></button>
          <button type="button" onClick={onToggleAutoScroll} aria-pressed={pinned} aria-label={pinLabel} className={`${tile} ${pinned ? "bg-primary/15 text-primary" : ""}`}><Icon name="push_pin" size={24} /><span aria-hidden="true" className={caption}>Ghim</span></button>
          <button type="button" disabled={explainDisabled} onClick={onExplain} aria-label="Giải thích câu đang hát bằng AI" className={tile}><Icon name="auto_awesome" size={24} /><span aria-hidden="true" className={caption}>Giải thích</span></button>
          {openPanel === "sync" && <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="absolute right-1 top-full z-40 mt-1" />}
        </div>
      </div>
    );
  }

  // Máy tính: viên thuốc nổi. Khung ngoài không bắt chuột (không che lời phía sau), chỉ viên thuốc nhận thao tác.
  return (
    <div role="group" aria-label="Điều khiển nhanh" className="pointer-events-none sticky bottom-6 z-30 hidden justify-center px-2 lg:flex">
      <div ref={barRef} className="pointer-events-auto relative flex items-center gap-1 rounded-full bg-inverse-surface px-2 py-1.5 shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
        {openPanel === "sync" && <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2" />}
        <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={round}><Icon name="replay_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50">
          <Icon name={playing ? "pause" : "play_arrow"} filled size={26} />
        </button>
        <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={round}><Icon name="forward_5" size={22} /></button>
        <div className="relative">
          <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát"
            className={`${round} ${looping ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="repeat_one" size={22} /></button>
          {looping && <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} className="absolute bottom-full left-1/2 z-40 mb-2 -translate-x-1/2" />}
        </div>
        <button type="button" onClick={() => onRate(nextRate)} aria-label={rateLabel}
          className="min-h-11 min-w-12 rounded-full px-2 text-label-md font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/15">{label(rate)}</button>
        <button type="button" onClick={() => setOpenPanel((p) => (p === "sync" ? null : "sync"))} aria-expanded={openPanel === "sync"} aria-label={offsetLabel}
          className={`${round} ${openPanel === "sync" || offset !== 0 ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="tune" size={22} /></button>
        <button type="button" onClick={onToggleAutoScroll} aria-pressed={pinned} aria-label={pinLabel}
          className={`${round} ${pinned ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="push_pin" size={22} /></button>
        <button type="button" disabled={explainDisabled} onClick={onExplain} aria-label="Giải thích câu đang hát bằng AI" title="Giải thích câu đang hát" className={round}><Icon name="auto_awesome" size={22} /></button>
      </div>
    </div>
  );
}
