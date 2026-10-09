"use client";

import { MAX_PLAYBACK_RATE, MIN_PLAYBACK_RATE, PLAYBACK_RATE_PRESETS, PLAYBACK_RATE_STEP, clampRate, formatRate } from "@/lib/user-state/listen-prefs";

// Điện thoại giữ vùng bấm 44 px; từ màn hình md trở lên thu nhỏ cho gọn.
const stepBtn = "flex h-11 w-9 shrink-0 items-center justify-center rounded-full text-title-md font-semibold text-on-surface hover:bg-surface-container-high disabled:opacity-40 md:h-8 md:w-8";

/**
 * Bảng chỉnh tốc độ nghe, gọn: dòng tiêu đề kèm mức hiện tại, thanh trượt (bước 0,05x) có nút −/+ hai bên, và hàng nút chọn nhanh các mức hay dùng.
 * Đặt ngay trên nút tốc độ (cha là khung `relative` bọc nút).
 */
export function PlaybackRatePopover({ rate, onChange, className = "" }: { rate: number; onChange: (rate: number) => void; className?: string }) {
  return (
    <div role="group" aria-label="Chỉnh tốc độ nghe" className={`w-[min(17rem,calc(100vw-1rem))] rounded-2xl bg-surface-container-lowest px-2.5 py-2 shadow-[0_8px_30px_rgba(20,10,5,0.35)] ring-1 ring-outline-variant ${className}`}>
      <div className="flex items-baseline justify-between px-1">
        <p className="text-label-sm text-on-surface-variant">Tốc độ nghe</p>
        <output aria-live="polite" className="font-mono text-label-md font-semibold text-on-surface">{formatRate(rate)}</output>
      </div>
      <div className="flex items-center">
        <button type="button" disabled={rate <= MIN_PLAYBACK_RATE} onClick={() => onChange(clampRate(rate - PLAYBACK_RATE_STEP))} aria-label="Giảm tốc độ 0,05" className={stepBtn}>−</button>
        <input
          type="range" aria-label="Tốc độ nghe" min={MIN_PLAYBACK_RATE} max={MAX_PLAYBACK_RATE} step={PLAYBACK_RATE_STEP} value={rate}
          onChange={(e) => onChange(clampRate(Number(e.target.value)))} className="h-11 min-w-0 flex-1 accent-primary md:h-8"
        />
        <button type="button" disabled={rate >= MAX_PLAYBACK_RATE} onClick={() => onChange(clampRate(rate + PLAYBACK_RATE_STEP))} aria-label="Tăng tốc độ 0,05" className={stepBtn}>+</button>
      </div>
      <div className="flex gap-1">
        {PLAYBACK_RATE_PRESETS.map((r) => (
          <button
            key={r} type="button" aria-pressed={rate === r} onClick={() => onChange(r)}
            className={`min-h-11 min-w-0 flex-1 rounded-full text-label-sm md:min-h-8 ${rate === r ? "bg-primary font-semibold text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
          >{String(r).replace(".", ",")}</button>
        ))}
      </div>
    </div>
  );
}
