"use client";

import { useDueCount } from "./use-due-count";

/** Huy hiệu số thẻ cần ôn cạnh mục "Ôn tập" (ẩn khi 0). `floating`: nằm góc trên phải icon (tab bar mobile). */
export function DueBadge({ floating = false }: { floating?: boolean }) {
  const count = useDueCount();
  if (!count) return null;
  return (
    <span
      className={`rounded-full bg-primary px-1.5 py-0.5 text-label-sm leading-none text-on-primary ${floating ? "absolute -right-3 -top-1" : "ml-1.5"}`}
    >
      {count}
      <span className="sr-only"> thẻ cần ôn</span>
    </span>
  );
}
