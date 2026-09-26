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
    <section aria-label="Chuỗi ngày học" className="mt-space-md flex flex-wrap items-center gap-x-space-lg gap-y-space-sm rounded-2xl bg-surface-container-low p-space-md">
      <div className="flex items-center gap-3">
        <span aria-hidden="true" className={`flex h-14 w-14 items-center justify-center rounded-full ${streak.current > 0 ? "bg-tertiary-fixed text-on-tertiary-fixed" : "bg-surface-container-high text-on-surface-variant"}`}>
          <Icon name="local_fire_department" filled />
        </span>
        <div>
          <p className="font-serif text-headline-md text-on-surface">{streak.current} <span className="text-body-md text-on-surface-variant">ngày liên tiếp</span></p>
          <p className="text-label-md text-on-surface-variant">
            {streak.studiedToday ? "Hôm nay bạn đã học rồi" : streak.current > 0 ? "Học hôm nay để giữ chuỗi" : "Học một chút hôm nay để bắt đầu chuỗi"}
            {streak.longest > streak.current && ` · kỷ lục ${streak.longest}`}
          </p>
        </div>
      </div>

      <div className="min-w-0 flex-1">
        <ol aria-label={`Tuần này: học ${streak.weekCount} trên ${WEEKLY_GOAL_DAYS} ngày mục tiêu`} className="flex justify-between gap-1 sm:justify-start sm:gap-3">
          {streak.week.map((d, i) => (
            <li key={d.day} className="flex flex-col items-center gap-1">
              <span className={`flex h-9 w-9 items-center justify-center rounded-full text-label-sm ${d.studied ? "bg-secondary text-on-secondary" : "bg-surface-container-high text-on-surface-variant"} ${d.isToday ? "ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low" : ""}`}>
                {d.studied ? <Icon name="check" /> : <span aria-hidden="true">·</span>}
                <span className="sr-only">{d.studied ? "Đã học" : "Chưa học"}</span>
              </span>
              <span className="text-label-sm text-on-surface-variant">{DAY_LABELS[i]}</span>
            </li>
          ))}
        </ol>
        <p className="mt-1 text-label-md text-on-surface-variant">{goalDone ? "Đã đạt mục tiêu tuần!" : `Mục tiêu tuần: ${streak.weekCount}/${WEEKLY_GOAL_DAYS} ngày`}</p>
      </div>

      <div className="flex flex-col items-start">
        <button type="button" onClick={() => void share()} disabled={streak.current === 0 && streak.learnedWords === 0}
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-4 text-label-md font-medium text-primary hover:bg-surface-container disabled:opacity-50">
          <Icon name="share" /> Chia sẻ
        </button>
        {note && <p role="status" className="text-label-sm text-on-surface-variant">{note}</p>}
      </div>
    </section>
  );
}
