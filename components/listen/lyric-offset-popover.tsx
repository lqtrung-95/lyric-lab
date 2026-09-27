"use client";

const fmt = (o: number) => `${o > 0 ? "+" : ""}${Number(o.toFixed(2)).toString().replace(".", ",")}s`;
const btn = "min-h-11 flex-1 rounded-full bg-surface-container-high px-3 text-label-md font-semibold text-on-surface hover:bg-surface-container-highest";

/**
 * Bảng nhỏ chỉnh thời gian hiện lời, viết bằng lời thường: lời hiện trễ hơn giọng hát thì bấm "Sớm hơn",
 * lời hiện sớm hơn giọng hát thì bấm "Muộn hơn". Tên nút gọi cho trình đọc màn hình bắt đầu bằng đúng chữ đang hiện.
 */
export function LyricOffsetPopover({ offset, onChange, className = "" }: { offset: number; onChange: (offset: number) => void; className?: string }) {
  return (
    <div role="group" aria-label="Chỉnh lời lệch" className={`w-[min(20rem,calc(100vw-1rem))] rounded-2xl bg-surface-container-lowest p-3 shadow-[0_8px_30px_rgba(20,10,5,0.35)] ring-1 ring-outline-variant ${className}`}>
      <p className="text-label-md font-semibold text-on-surface">Chỉnh thời gian hiện lời</p>
      <p className="mt-2 text-label-sm text-on-surface-variant">Lời hiện trễ hơn giọng hát?</p>
      <div className="mt-1 flex gap-2">
        <button type="button" className={btn} onClick={() => onChange(offset - 0.5)} aria-label="Sớm hơn 0,5 giây">Sớm hơn 0,5s</button>
        <button type="button" className={btn} onClick={() => onChange(offset - 0.1)} aria-label="Sớm hơn 0,1 giây">Sớm hơn 0,1s</button>
      </div>
      <p className="mt-2 text-label-sm text-on-surface-variant">Lời hiện sớm hơn giọng hát?</p>
      <div className="mt-1 flex gap-2">
        <button type="button" className={btn} onClick={() => onChange(offset + 0.1)} aria-label="Muộn hơn 0,1 giây">Muộn hơn 0,1s</button>
        <button type="button" className={btn} onClick={() => onChange(offset + 0.5)} aria-label="Muộn hơn 0,5 giây">Muộn hơn 0,5s</button>
      </div>
      <div className="mt-2 flex items-center justify-between">
        <p className="text-label-sm text-on-surface-variant">Đang lệch: <output aria-live="polite" className="font-mono text-on-surface">{offset === 0 ? "0s" : fmt(offset)}</output></p>
        <button type="button" disabled={offset === 0} onClick={() => onChange(0)} className="min-h-11 rounded-full px-3 text-label-md font-medium text-primary hover:bg-surface-container disabled:opacity-40">Đặt lại</button>
      </div>
    </div>
  );
}
