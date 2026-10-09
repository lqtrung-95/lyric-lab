"use client";

import { useEffect, useRef } from "react";
import { MOOD_GROUPS, type MoodGroupId } from "@/lib/library/mood-groups";

interface MoodChipsProps {
  value: MoodGroupId | null;
  onChange: (value: MoodGroupId | null) => void;
  /** Số bài của từng nhóm trong danh sách đang xem. Nhóm có 0 bài bị ẩn (trừ nhóm đang chọn); không có `counts` thì hiện đủ mọi nhóm. */
  counts?: Partial<Record<MoodGroupId, number>>;
  className?: string;
}

const chip = (on: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center whitespace-nowrap rounded-full px-4 text-label-md transition-colors ${on ? "bg-primary font-semibold text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`;

/**
 * Một hàng chip lọc theo nhóm cảm xúc ("Tất cả" + nhãn ngắn của từng nhóm), luôn một dòng và cuộn ngang khi hẹp để không chiếm nhiều chỗ. Số bài không in
 * lên chip (rối mắt) mà nằm trong tên đọc cho trình đọc màn hình và tooltip.
 */
export function MoodChips({ value, onChange, counts, className = "" }: MoodChipsProps) {
  const groups = MOOD_GROUPS.filter((g) => !counts || (counts[g.id] ?? 0) > 0 || g.id === value);
  const rowRef = useRef<HTMLDivElement>(null);
  // Chip đang chọn nằm ngoài vùng nhìn (điện thoại, mở thẳng link có ?mood=) thì cuộn hàng chip tới nó; chỉ cuộn trong hàng, không đụng tới cuộn của trang.
  useEffect(() => {
    const row = rowRef.current;
    const active = row?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (row && active && value !== null) row.scrollTo({ left: active.offsetLeft - (row.clientWidth - active.offsetWidth) / 2, behavior: "smooth" });
  }, [value]);
  return (
    <div ref={rowRef} role="group" aria-label="Lọc theo cảm xúc" className={`flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chip(value === null)}>Tất cả</button>
      {groups.map((g) => {
        const count = counts?.[g.id];
        const name = count === undefined ? g.label : `${g.label} (${count} bài)`;
        return (
          <button key={g.id} type="button" aria-pressed={value === g.id} aria-label={name} title={name} onClick={() => onChange(value === g.id ? null : g.id)} className={chip(value === g.id)}>
            {g.short}
          </button>
        );
      })}
    </div>
  );
}
