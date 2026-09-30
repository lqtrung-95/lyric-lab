"use client";

import { Icon } from "@/components/ui/icon";
import { REPEAT_COUNT_OPTIONS, REPEAT_DELAY_OPTIONS, repeatCountLabel, repeatDelayLabel, type RepeatConfig } from "@/lib/listen/repeat-config";

interface RepeatConfigChipsProps {
  value: RepeatConfig;
  onChange: (v: RepeatConfig) => void;
  className?: string;
}

const chip = "flex h-8 items-center gap-1 rounded-full bg-inverse-surface px-3 text-label-sm font-semibold text-inverse-on-surface shadow-md";

/**
 * 2 chip nổi ngay trên nút Lặp câu khi đang bật, chỉnh nhanh khoảng nghỉ và số lần lặp — bấm là chuyển sang giá trị
 * tiếp theo trong danh sách, không cần mở bảng riêng (đỡ chật thanh điều khiển chính).
 */
export function RepeatConfigChips({ value, onChange, className = "" }: RepeatConfigChipsProps) {
  const nextDelay = REPEAT_DELAY_OPTIONS[(REPEAT_DELAY_OPTIONS.indexOf(value.delaySec as (typeof REPEAT_DELAY_OPTIONS)[number]) + 1) % REPEAT_DELAY_OPTIONS.length];
  const countIndex = REPEAT_COUNT_OPTIONS.indexOf(value.times);
  const nextTimes = REPEAT_COUNT_OPTIONS[(countIndex + 1) % REPEAT_COUNT_OPTIONS.length];

  return (
    <div className={`anim-chip-in flex items-center gap-1.5 ${className}`}>
      <button
        type="button"
        onClick={() => onChange({ ...value, delaySec: nextDelay })}
        aria-label={`Khoảng nghỉ giữa mỗi lần lặp: ${repeatDelayLabel(value.delaySec)}, bấm để đổi`}
        className={chip}
      >
        <Icon name="hourglass_top" size={14} />
        {repeatDelayLabel(value.delaySec)}
      </button>
      <button
        type="button"
        onClick={() => onChange({ ...value, times: nextTimes })}
        aria-label={`Số lần lặp: ${repeatCountLabel(value.times)}, bấm để đổi`}
        className={chip}
      >
        <Icon name="laps" size={14} />
        {value.times === null ? "∞" : value.times}
      </button>
    </div>
  );
}
