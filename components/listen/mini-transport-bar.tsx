"use client";

import { useEffect, useState, type RefObject } from "react";
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
}

const round = "flex h-11 w-11 items-center justify-center rounded-full text-inverse-on-surface transition-colors hover:bg-inverse-on-surface/15 disabled:opacity-50";

/**
 * Thanh điều khiển thu gọn nổi ở đáy màn hình: lùi 5s, phát/dừng, tới 5s, lặp câu, đổi tốc độ.
 * Chỉ hiện khi thanh điều khiển đầy đủ đã cuộn khuất (`visible`), để người dùng vẫn điều khiển được khi đọc lời ở phía dưới.
 */
export function MiniTransportBar({ visible, ready, playing, onTogglePlay, onSeekBy, looping, onToggleLoop, rate, onRate }: MiniTransportBarProps & { visible: boolean }) {
  if (!visible) return null;
  const nextRate = PLAYBACK_RATES[(PLAYBACK_RATES.indexOf(rate as never) + 1) % PLAYBACK_RATES.length];
  const label = (r: number) => (r === 1 ? "1x" : `${String(r).replace(".", ",")}x`);
  // Khung ngoài rộng cả cột nhưng không bắt chuột (không che lời phía sau); chỉ viên thuốc bên trong nhận thao tác.
  return (
    <div role="group" aria-label="Điều khiển nhanh" className="pointer-events-none sticky bottom-32 z-30 flex justify-center px-2 lg:bottom-6">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full bg-inverse-surface px-2 py-1.5 shadow-[0_8px_30px_rgba(20,10,5,0.35)]">
        <button type="button" disabled={!ready} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={round}><Icon name="replay_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onTogglePlay} aria-label={playing ? "Tạm dừng" : "Phát"}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container text-on-primary-container transition-transform hover:bg-primary hover:text-on-primary active:scale-95 disabled:opacity-50">
          <Icon name={playing ? "pause" : "play_arrow"} filled size={26} />
        </button>
        <button type="button" disabled={!ready} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={round}><Icon name="forward_5" size={22} /></button>
        <button type="button" disabled={!ready} onClick={onToggleLoop} aria-pressed={looping} aria-label="Lặp câu đang hát"
          className={`${round} ${looping ? "!bg-primary-container/40 text-inverse-primary" : ""}`}><Icon name="repeat_one" size={22} /></button>
        <button type="button" onClick={() => onRate(nextRate)} aria-label={`Tốc độ ${label(rate)}, bấm để đổi sang ${label(nextRate)}`}
          className="min-h-11 min-w-12 rounded-full px-2 text-label-md font-semibold text-inverse-on-surface hover:bg-inverse-on-surface/15">{label(rate)}</button>
      </div>
    </div>
  );
}
