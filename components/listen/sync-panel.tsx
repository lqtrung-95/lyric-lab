"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import type { SyncRisk } from "@/lib/listen/lyric-offset";

interface SyncPanelProps {
  offset: number;
  risk: SyncRisk;
  /** Đang ở chế độ "đồng bộ nhanh": bấm một dòng lời sẽ đặt độ lệch thay vì tua video. */
  quickSync: boolean;
  onOffsetChange: (offset: number) => void;
  onToggleQuickSync: () => void;
}

const fmt = (o: number) => `${o > 0 ? "+" : ""}${Number(o.toFixed(2))} giây`;
const step = "min-h-11 min-w-16 rounded-full bg-surface-container-high px-3 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest";

/**
 * Chỉnh lệch lời so với video: nút ±0,1 s và ±0,5 s, "đồng bộ nhanh" bằng cách bấm dòng đang được hát, và đặt lại.
 * Khi lời có dấu hiệu lệch (độ dài không khớp video) hiện gợi ý mở bảng chỉnh.
 */
export function SyncPanel({ offset, risk, quickSync, onOffsetChange, onToggleQuickSync }: SyncPanelProps) {
  const [open, setOpen] = useState(false);
  const show = open || quickSync;

  return (
    <section aria-label="Chỉnh lời khớp nhạc" className="rounded-xl bg-surface-container-low p-space-md">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <button type="button" aria-expanded={show} onClick={() => setOpen((o) => !o)}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-label-md font-semibold text-primary hover:bg-surface-container">
            <Icon name="tune" size={20} />
            Lời bị lệch? Chỉnh lời
          </button>
          {offset !== 0 && <span className="ml-1 rounded-full bg-primary/10 px-2 py-1 text-label-sm text-primary">Đang lệch {fmt(offset)}</span>}
        </div>
      </div>

      {risk === "likely_off" && offset === 0 && !show && (
        <p role="status" className="mt-1 px-3 text-label-md text-on-surface-variant">
          Độ dài lời không khớp với video này, có thể lời sẽ lệch nhạc. Nếu thấy lệch, hãy chỉnh lời.
        </p>
      )}

      {show && (
        <div className="mt-space-sm space-y-space-md">
          <div>
            <p className="text-label-md text-on-surface-variant">Chỉnh từng bước (lời hiện sớm hơn hoặc muộn hơn so với giọng hát):</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button type="button" className={step} onClick={() => onOffsetChange(offset - 0.5)} aria-label="Lời sớm hơn 0,5 giây">−0,5s</button>
              <button type="button" className={step} onClick={() => onOffsetChange(offset - 0.1)} aria-label="Lời sớm hơn 0,1 giây">−0,1s</button>
              <output aria-live="polite" className="min-w-24 text-center font-mono text-body-md text-on-surface">{fmt(offset)}</output>
              <button type="button" className={step} onClick={() => onOffsetChange(offset + 0.1)} aria-label="Lời muộn hơn 0,1 giây">+0,1s</button>
              <button type="button" className={step} onClick={() => onOffsetChange(offset + 0.5)} aria-label="Lời muộn hơn 0,5 giây">+0,5s</button>
            </div>
            <p className="mt-1 text-label-sm text-on-surface-variant">Dấu − : lời hiện sớm hơn. Dấu + : lời hiện muộn hơn.</p>
          </div>

          <div>
            <button type="button" aria-pressed={quickSync} onClick={onToggleQuickSync}
              className={`inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-semibold ${quickSync ? "bg-primary text-on-primary" : "bg-secondary-container text-on-secondary-container"}`}>
              <Icon name="sync" size={18} />
              {quickSync ? "Đang đồng bộ nhanh: bấm vào dòng đang được hát" : "Đồng bộ nhanh"}
            </button>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Cho video chạy, đợi đến khi ca sĩ vừa bắt đầu hát một câu, rồi bấm vào đúng dòng lời của câu đó. Lời sẽ khớp ngay; chỉnh thêm bằng các nút ở trên nếu cần.
            </p>
          </div>

          <button type="button" disabled={offset === 0} onClick={() => onOffsetChange(0)}
            className="min-h-11 rounded-full px-4 text-label-md font-medium text-on-surface-variant hover:bg-surface-container disabled:opacity-50">
            Đặt lại (không lệch)
          </button>
        </div>
      )}
    </section>
  );
}
