"use client";

import { MOOD_GROUPS, type MoodGroupId } from "@/lib/library/mood-groups";

interface MoodChipsProps {
  value: MoodGroupId | null;
  onChange: (value: MoodGroupId | null) => void;
  /** Số bài của từng nhóm trong danh sách đang xem. Nhóm có 0 bài bị ẩn (trừ nhóm đang chọn); không có `counts` thì hiện đủ mọi nhóm. */
  counts?: Partial<Record<MoodGroupId, number>>;
  className?: string;
}

const chip = (on: boolean) =>
  `inline-flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-4 text-label-md transition-colors ${on ? "bg-primary font-semibold text-on-primary" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`;

/** Hàng chip lọc theo nhóm cảm xúc ("Tất cả" + các nhóm). Điện thoại cuộn ngang một hàng, màn rộng xuống dòng. */
export function MoodChips({ value, onChange, counts, className = "" }: MoodChipsProps) {
  const groups = MOOD_GROUPS.filter((g) => !counts || (counts[g.id] ?? 0) > 0 || g.id === value);
  return (
    <div role="group" aria-label="Lọc theo cảm xúc" className={`flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0 ${className}`}>
      <button type="button" aria-pressed={value === null} onClick={() => onChange(null)} className={chip(value === null)}>Tất cả</button>
      {groups.map((g) => (
        <button key={g.id} type="button" aria-pressed={value === g.id} onClick={() => onChange(value === g.id ? null : g.id)} className={chip(value === g.id)}>
          {g.label}
          {counts && counts[g.id] !== undefined && <span className={`text-label-sm ${value === g.id ? "text-on-primary/80" : "text-on-surface-variant"}`}>{counts[g.id]}</span>}
        </button>
      ))}
    </div>
  );
}
