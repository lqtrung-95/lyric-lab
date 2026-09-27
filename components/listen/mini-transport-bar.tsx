"use client";

import { useEffect, useRef, useState, type RefObject } from "react";
import { Icon } from "@/components/ui/icon";
import { PLAYBACK_RATES } from "@/lib/user-state/listen-prefs";

/** Phần tử có đang nằm trong màn hình không (mặc định true để không nháy khi mới tải). */
export function useIsInView(ref: RefObject<HTMLElement | null>): boolean {
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const el = ref.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting));
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);
  return inView;
}

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
}

const round = "flex h-11 w-11 items-center justify-center rounded-full text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/15 disabled:opacity-50";

/**
 * Thanh điều khiển thu gọn nổi ở đáy màn hình: lùi 5s, phát/dừng, tới 5s, lặp câu, đổi tốc độ.
 * Chỉ hiện khi thanh điều khiển đầy đủ đã cuộn khuất (`visible`), để người dùng vẫn điều khiển được khi đọc lời ở phía dưới.
 */
export function MiniTransportBar({ visible, ready, playing, onTogglePlay, onSeekBy, looping, onToggleLoop, rate, onRate, offset, onOffsetChange }: MiniTransportBarProps & { visible: boolean }) {
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
  if (!visible) return null;
  const nextRate = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate as never) + 1) % PLAYBACK_RATES.length];
  const label = (r: number) => (r === 1 ? "1x" : `${String(r).replace(".", ",")}x`);
  const fmt = (o: number) => `${o > 0 ? "+" : ""}${Number(o.toFixed(2))}s`;
  const nudge = "min-h-11 min-w-14 rounded-full px-2 text-label-md font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/15";
  // Điện thoại: ghim sát đáy màn hình (không nằm giữa lời); máy tính: viên thuốc nổi trong cột. Khung ngoài không bắt chuột, chỉ viên thuốc nhận thao tác.
  return (
    <div role="group" aria-label="Điều khiển nhanh" className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:sticky lg:bottom-6 lg:pb-0">
      <div ref={barRef} className="pointer-events-auto relative flex items-center gap-0.5 rounded-full bg-inverse-surface px-2 py-1.5 shadow-[0_8px_30px_rgba(20,10,5,0.35)] sm:gap-1">
        {syncOpen && (
          <div role="group" aria-label="Chỉnh lời lệch" className="absolute bottom-full left-1/2 mb-2 flex -translate-x-1/2 items-center gap-0.5 rounded-full bg-inverse-surface px-2 py-1.5 shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
            <button type="button" className={nudge} onClick={() => onOffsetChange(offset - 0.5)} aria-label="Lời sớm hơn 0,5 giây">−0,5</button>
            <button type="button" className={nudge} onClick={() => onOffsetChange(offset - 0.1)} aria-label="Lời sớm hơn 0,1 giây">−0,1</button>
            <output aria-live="polite" className="min-w-14 text-center font-mono text-label-md text-inverse-on-surface">{fmt(offset)}</output>
            <button type="button" className={nudge} onClick={() => onOffsetChange(offset + 0.1)} aria-label="Lời muộn hơn 0,1 giây">+0,1</button>
            <button type="button" className={nudge} onClick={() => onOffsetChange(offset + 0.5)} aria-label="Lời muộn hơn 0,5 giây">+0,5</button>
          </div>
        )}
        <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={round}><Icon name="replay_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50">
          <Icon name={playing ? "pause" : "play_arrow"} filled size={26} />
        </button>
        <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={round}><Icon name="forward_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát"
          className={`${round} ${looping ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="repeat_one" size={22} /></button>
        <button type="button" onClick={() => onRate(nextRate)} aria-label={`Tốc độ ${label(rate)}, bấm để đổi sang ${label(nextRate)}`}
          className="min-h-11 min-w-11 rounded-full px-1.5 text-label-md font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/15">{label(rate)}</button>
        <button type="button" onClick={() => setSyncOpen((o) => !o)} aria-expanded={syncOpen} aria-label={`Chỉnh lời lệch (đang ${fmt(offset)})`}
          className={`${round} ${syncOpen || offset !== 0 ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="tune" size={22} /></button>
      </div>
    </div>
  );
}
