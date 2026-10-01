"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { PlayerController } from "@/components/player/use-youtube-player";
import { formatTimestamp } from "@/lib/preview/preview-format";

interface PlaybackProgressBarProps {
  controller: PlayerController | null;
  /** Tổng thời lượng bài (giây); 0/chưa có thì ẩn thanh kéo, chỉ còn 2 nút ±5 giây. */
  durationSec: number;
  onSeekBy: (deltaSec: number) => void;
}

const seekBtn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-on-surface-variant transition-colors hover:bg-surface-container-high lg:h-14 lg:w-14";

/**
 * Hàng hiển thị vị trí đang phát: mốc hiện tại, thanh kéo tới vị trí bất kỳ trong bài, tổng thời lượng, và 2 nút
 * lùi/tới nhanh 5 giây ngay cạnh hai mốc thời gian. Đọc `getCurrentTime()` định kỳ thay vì đăng ký sự kiện (YouTube
 * IFrame API không phát sự kiện tiến độ liên tục); khi người dùng kéo/bấm thanh thì ưu tiên hiển thị giá trị vừa
 * chọn (`dragTime`), không để lần đọc định kỳ tiếp theo đè mất thao tác dở dang.
 */
export function PlaybackProgressBar({ controller, durationSec, onSeekBy }: PlaybackProgressBarProps) {
  const [time, setTime] = useState(0);
  const [dragTime, setDragTime] = useState<number | null>(null);

  useEffect(() => {
    if (!controller) return;
    const id = setInterval(() => {
      const t = controller.getCurrentTime();
      setTime(t);
      // `seekTo()` của YouTube không xong ngay: vài lần đọc định kỳ kế tiếp vẫn trả vị trí CŨ trước khi video thực
      // sự nhảy tới. Xoá `dragTime` ngay khi nhả tay (thay vì chờ đọc được đúng vị trí) làm thanh nhảy về vị trí cũ
      // rồi mới nhảy lại vị trí đã chọn — chỉ coi là xong và bỏ giá trị tạm khi đọc được vị trí thật sự khớp.
      setDragTime((d) => (d !== null && Math.abs(t - d) < 0.75 ? null : d));
    }, 250);
    return () => clearInterval(id);
  }, [controller]);

  const shown = dragTime ?? time;

  return (
    <div className="flex items-center gap-1">
      <button type="button" disabled={!controller} onClick={() => onSeekBy(-5)} aria-label="Lùi 5 giây" className={seekBtn}>
        <Icon name="replay_5" size={null} className="text-[20px] lg:text-[26px]" />
      </button>
      <span className="w-9 shrink-0 text-right text-label-sm tabular-nums text-on-surface-variant lg:w-11 lg:text-[15px]">{formatTimestamp(shown)}</span>
      <input
        type="range" aria-label="Vị trí phát" min={0} max={Math.max(durationSec, 0.1)} step={0.1}
        value={Math.min(shown, Math.max(durationSec, 0.1))} disabled={!controller || durationSec <= 0}
        onChange={(e) => { const v = Number(e.target.value); setDragTime(v); controller?.seekTo(v); }}
        className="h-11 min-w-0 flex-1 accent-primary disabled:opacity-40 lg:h-14"
      />
      <span className="w-9 shrink-0 text-label-sm tabular-nums text-on-surface-variant lg:w-11 lg:text-[15px]">{formatTimestamp(durationSec)}</span>
      <button type="button" disabled={!controller} onClick={() => onSeekBy(5)} aria-label="Tới 5 giây" className={seekBtn}>
        <Icon name="forward_5" size={null} className="text-[20px] lg:text-[26px]" />
      </button>
    </div>
  );
}
