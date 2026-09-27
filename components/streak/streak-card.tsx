"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { track } from "@/lib/analytics/track";
import { renderShareCard, shareOrDownload } from "@/lib/streak/share-card";
import { WEEKLY_GOAL_DAYS } from "@/lib/streak/streak-logic";
import { useStreak } from "./use-streak";

const DAY_LABELS = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

/** Thẻ chuỗi ngày học + mục tiêu tuần (5 ngày) trên trang chủ, kèm nút chia sẻ ảnh kết quả. */
export function StreakCard() {
  const streak = useStreak();
  const [note, setNote] = useState("");

  if (streak === null) return null;
  if (streak === undefined) return <div aria-hidden="true" className="mt-space-md h-28 animate-pulse rounded-2xl bg-surface-container-high motion-reduce:animate-none" />;

  const goalDone = streak.weekCount >= WEEKLY_GOAL_DAYS;

  async function share() {
    if (!streak) return;
    track("share_card");
    try {
      const result = await shareOrDownload(await renderShareCard(streak));
      setNote(result === "downloaded" ? "Đã tải ảnh về máy." : "");
    } catch {
      setNote("Chưa tạo được ảnh. Thử lại sau nhé.");
    }
  }

  return (
    <section aria-label="Chuỗi ngày học" className="mt-space-md flex flex-col gap-2 rounded-2xl bg-surface-container-low px-space-md py-3 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-space-lg">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${streak.current > 0 ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
          <Icon name="local_fire_department" filled />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-serif text-headline-md leading-tight text-on-surface">{streak.current} <span className="font-sans text-body-md text-on-surface-variant">ngày liên tiếp</span></p>
          <p className="text-label-md text-on-surface-variant">
            {streak.studiedToday ? "Hôm nay bạn đã học rồi" : streak.current > 0 ? "Học hôm nay để giữ chuỗi" : "Học một chút hôm nay để bắt đầu chuỗi"}
            {streak.longest > streak.current && ` · kỷ lục ${streak.longest}`}
          </p>
        </div>
        {/* Điện thoại: nút chia sẻ nằm cùng hàng với số chuỗi (chỉ icon) để thẻ không dài ra. */}
        <ShareButton onClick={() => void share()} disabled={streak.current === 0 && streak.learnedWords === 0} className="md:hidden" />
      </div>

      <div className="min-w-0 md:justify-self-center">
        <ol aria-label={`Tuần này: học ${streak.weekCount} trên ${WEEKLY_GOAL_DAYS} ngày mục tiêu`} className="flex justify-between gap-1 md:justify-start md:gap-3">
          {streak.week.map((d, i) => (
            <li key={d.day} className="flex flex-col items-center gap-1.5">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-label-sm ${d.studied ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"} ${d.isToday ? "ring-2 ring-primary ring-offset-1 ring-offset-surface-container-low" : ""}`}>
                {d.studied ? <Icon name="check" size={18} /> : <span aria-hidden="true">·</span>}
                <span className="sr-only">{d.studied ? "Đã học" : "Chưa học"}</span>
              </span>
              <span className="text-[11px] leading-none text-on-surface-variant">{DAY_LABELS[i]}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1.5 text-label-sm text-on-surface-variant">{goalDone ? "Đã đạt mục tiêu tuần!" : `Mục tiêu tuần: ${streak.weekCount}/${WEEKLY_GOAL_DAYS} ngày`}</p>
      </div>

      <div className="hidden md:block">
        <ShareButton onClick={() => void share()} disabled={streak.current === 0 && streak.learnedWords === 0} withLabel />
        {note && <p role="status" className="text-label-sm text-on-surface-variant">{note}</p>}
      </div>
      {note && <p role="status" className="text-label-sm text-on-surface-variant md:hidden">{note}</p>}
    </section>
  );
}

function ShareButton({ onClick, disabled, withLabel = false, className = "" }: { onClick: () => void; disabled: boolean; withLabel?: boolean; className?: string }) {
  return (
    <button type="button" onClick={onClick} disabled={disabled} aria-label="Chia sẻ"
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full text-label-md font-medium text-primary hover:bg-surface-container disabled:opacity-50 ${withLabel ? "px-4" : "min-w-11"} ${className}`}>
      <Icon name="share" />{withLabel && "Chia sẻ"}
    </button>
  );
}
