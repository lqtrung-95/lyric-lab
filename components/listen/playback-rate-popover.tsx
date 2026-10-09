"use client";

import { MAX_PLAYBACK_RATE, MIN_PLAYBACK_RATE, PLAYBACK_RATE_PRESETS, PLAYBACK_RATE_STEP, clampRate, formatRate } from "@/lib/user-state/listen-prefs";

const stepBtn = "flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-title-md font-semibold text-on-surface hover:bg-surface-container-highest disabled:opacity-40";

/**
 * Bảng chỉnh tốc độ nghe: thanh trượt (bước 0,05x) kèm nút −/+ để chỉnh mịn, và hàng nút chọn nhanh các mức hay dùng.
 * Mức hiện tại đọc to ở giữa; mức 1x có nhãn "Chuẩn" bên dưới để dễ quay về.
 */
export function PlaybackRatePopover({ rate, onChange, className = "" }: { rate: number; onChange: (rate: number) => void; className?: string }) {
  return (
    <div role="group" aria-label="Chỉnh tốc độ nghe" className={`w-[min(22rem,calc(100vw-1rem))] rounded-2xl bg-surface-container-lowest p-3 shadow-[0_8px_30px_rgba(20,10,5,0.35)] ring-1 ring-outline-variant ${className}`}>
      <p className="text-label-md font-semibold text-on-surface">Tốc độ nghe</p>
      <output aria-live="polite" className="mt-1 block text-center font-mono text-headline-md text-on-surface">{formatRate(rate)}</output>
      <div className="mt-2 flex items-center gap-2">
        <button type="button" disabled={rate <= MIN_PLAYBACK_RATE} onClick={() => onChange(clampRate(rate - PLAYBACK_RATE_STEP))} aria-label="Giảm tốc độ 0,05" className={stepBtn}>−</button>
        <input
          type="range" aria-label="Tốc độ nghe" min={MIN_PLAYBACK_RATE} max={MAX_PLAYBACK_RATE} step={PLAYBACK_RATE_STEP} value={rate}
          onChange={(e) => onChange(clampRate(Number(e.target.value)))} className="h-11 min-w-0 flex-1 accent-primary"
        />
        <button type="button" disabled={rate >= MAX_PLAYBACK_RATE} onClick={() => onChange(clampRate(rate + PLAYBACK_RATE_STEP))} aria-label="Tăng tốc độ 0,05" className={stepBtn}>+</button>
      </div>
      <div className="mt-2 flex gap-1.5">
        {PLAYBACK_RATE_PRESETS.map((r) => (
          <div key={r} className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
            <button
              type="button" aria-pressed={rate === r} onClick={() => onChange(r)}
              className={`min-h-11 w-full rounded-full px-1 text-label-md ${rate === r ? "bg-primary font-semibold text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
            >{String(r).replace(".", ",")}</button>
            <span className="h-4 whitespace-nowrap text-[11px] leading-4 text-on-surface-variant">{r === 1 ? "Chuẩn" : ""}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
