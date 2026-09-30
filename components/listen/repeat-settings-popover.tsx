"use client";

import { REPEAT_COUNT_OPTIONS, REPEAT_DELAY_OPTIONS, repeatCountLabel, repeatDelayLabel, type RepeatConfig } from "@/lib/listen/repeat-config";

const chip = "min-h-11 flex-1 rounded-full px-2 text-label-md font-semibold";
const chipOn = "bg-primary text-on-primary";
const chipOff = "bg-surface-container-high text-on-surface hover:bg-surface-container-highest";

/** Bảng cấu hình "Lặp câu": số lần lặp và khoảng nghỉ giữa mỗi lần, cho người học kịp nhắc lại trước khi nghe tiếp. */
export function RepeatSettingsPopover({ value, onChange, className = "" }: { value: RepeatConfig; onChange: (v: RepeatConfig) => void; className?: string }) {
  return (
    <div role="group" aria-label="Cấu hình lặp câu" className={`w-[min(20rem,calc(100vw-1rem))] rounded-2xl bg-surface-container-lowest p-3 shadow-[0_8px_30px_rgba(20,10,5,0.35)] ring-1 ring-outline-variant ${className}`}>
      <p className="text-label-md font-semibold text-on-surface">Số lần lặp</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {REPEAT_COUNT_OPTIONS.map((times) => (
          <button key={times ?? "inf"} type="button" aria-pressed={value.times === times} onClick={() => onChange({ ...value, times })} className={`${chip} ${value.times === times ? chipOn : chipOff}`}>
            {repeatCountLabel(times)}
          </button>
        ))}
      </div>
      <p className="mt-3 text-label-md font-semibold text-on-surface">Khoảng nghỉ giữa mỗi lần</p>
      <div className="mt-1 flex flex-wrap gap-1.5">
        {REPEAT_DELAY_OPTIONS.map((delaySec) => (
          <button key={delaySec} type="button" aria-pressed={value.delaySec === delaySec} onClick={() => onChange({ ...value, delaySec })} className={`${chip} ${value.delaySec === delaySec ? chipOn : chipOff}`}>
            {repeatDelayLabel(delaySec)}
          </button>
        ))}
      </div>
    </div>
  );
}
