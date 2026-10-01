"use client";

import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { RepeatConfig } from "@/lib/listen/repeat-config";
import { LyricOffsetPopover } from "./lyric-offset-popover";
import { RepeatConfigChips } from "./repeat-config-chips";
import { PLAYBACK_RATES } from "@/lib/user-state/listen-prefs";

interface MiniTransportBarProps {
  visible: boolean;
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
  /** Mở popup luyện phát âm riêng cho câu đang hát (Nghe → Nghĩ → Hát → Nghe lại), giống nút của app Miraa. */
  onPractice: () => void;
  practiceDisabled: boolean;
}

const round = "flex h-11 w-11 items-center justify-center rounded-full text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/15 disabled:opacity-50";

/**
 * Thanh điều khiển thu gọn cho máy tính: viên thuốc nổi ở đáy cột, chỉ hiện khi thanh điều khiển đầy đủ đã cuộn
 * khuất (`visible`). Bản điện thoại dùng `MobilePlaybackBar` riêng (gắn dưới video, luôn hiện, có thêm thanh kéo
 * vị trí phát) — hai bản khác nhau nhiều nên tách component thay vì gộp chung một nơi.
 */
export function MiniTransportBar({ visible, ready, playing, onTogglePlay, onSeekBy, looping, onToggleLoop, rate, onRate, offset, onOffsetChange, autoScroll, onToggleAutoScroll, repeatConfig, onRepeatConfigChange, onExplain, explainDisabled, onPractice, practiceDisabled }: MiniTransportBarProps) {
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
  if (!visible) return null;
  const nextRate = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate as never) + 1) % PLAYBACK_RATES.length];
  const label = (r: number) => (r === 1 ? "1x" : `${String(r).replace(".", ",")}x`);
  const rateLabel = `Tốc độ ${label(rate)}, bấm để đổi sang ${label(nextRate)}`;
  const offsetLabel = `Chỉnh thời gian hiện lời (đang lệch ${Number(offset.toFixed(2))} giây)`;
  const pinned = !autoScroll;
  const pinLabel = pinned ? "Bỏ ghim, tự cuộn theo câu đang hát" : "Ghim, không tự cuộn theo câu đang hát";

  // Viên thuốc luôn đứng yên ở `bottom-6` — 2 chip lặp câu xếp thành hàng riêng NGAY TRONG luồng bình thường phía
  // trên nó, không đẩy cả khối lên bằng cách đổi bottom-offset như trước (làm viên thuốc nhảy vị trí mỗi lần
  // bật/tắt lặp câu). Khung ngoài không bắt chuột (không che lời phía sau), chỉ viên thuốc/chip nhận thao tác.
  return (
    <div data-floating-controls role="group" aria-label="Điều khiển nhanh" className="pointer-events-none sticky bottom-6 z-30 hidden flex-col items-center gap-2 px-2 lg:flex">
      {looping && <RepeatConfigChips value={repeatConfig} onChange={onRepeatConfigChange} className="pointer-events-auto" />}
      <div ref={barRef} className="pointer-events-auto relative flex items-center gap-1 rounded-full bg-inverse-surface px-2 py-1.5 shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
        {openPanel === "sync" && <LyricOffsetPopover offset={offset} onChange={onOffsetChange} className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2" />}
        <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={round}><Icon name="replay_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50">
          <Icon name={playing ? "pause" : "play_arrow"} filled size={26} />
        </button>
        <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={round}><Icon name="forward_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát"
          className={`${round} ${looping ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="repeat_one" size={22} /></button>
        <button type="button" onClick={() => onRate(nextRate)} aria-label={rateLabel}
          className="min-h-11 min-w-12 rounded-full px-2 text-label-md font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/15">{label(rate)}</button>
        <button type="button" onClick={() => setOpenPanel((p) => (p === "sync" ? null : "sync"))} aria-expanded={openPanel === "sync"} aria-label={offsetLabel}
          className={`${round} ${openPanel === "sync" || offset !== 0 ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="tune" size={22} /></button>
        <button type="button" onClick={onToggleAutoScroll} aria-pressed={pinned} aria-label={pinLabel}
          className={`${round} ${pinned ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="push_pin" size={22} /></button>
        <button type="button" disabled={explainDisabled} onClick={onExplain} aria-label="Giải thích câu đang hát bằng AI" title="Giải thích câu đang hát" className={round}><Icon name="auto_awesome" size={22} /></button>
        <button type="button" disabled={practiceDisabled} onClick={onPractice} aria-label="Luyện phát âm câu đang hát" title="Luyện phát âm" className={round}><Icon name="mic" size={22} /></button>
      </div>
    </div>
  );
}
