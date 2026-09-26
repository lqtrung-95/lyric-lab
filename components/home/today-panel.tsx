"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useDueCount } from "@/components/review/use-due-count";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";

const noop = () => () => {};
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
};

/**
 * Bảng "Hôm nay" cạnh ô dán link: số thẻ cần ôn (lối vào buổi ôn) cùng số từ đã lưu và số bài đã mở.
 * Luôn có mặt (kể cả khi 0) để bố cục trang không thay đổi và người mới thấy ngay ứng dụng sẽ theo dõi gì cho họ.
 */
export function TodayPanel() {
  const due = useDueCount();
  const { state } = useLearnerState();
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);
  const songs = useMemo(() => parseRecentSongs(recentRaw).length, [recentRaw]);
  const hasDue = (due ?? 0) > 0;

  return (
    <section aria-labelledby="today-heading" className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-space-lg shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
      <div>
        <h2 id="today-heading" className="text-label-md font-semibold uppercase tracking-widest text-secondary">Hôm nay</h2>
        <p className="mt-space-sm flex items-baseline gap-2">
          <span className="font-serif text-[56px] font-semibold leading-none text-primary">{due ?? 0}</span>
          <span className="text-body-lg text-on-surface-variant">thẻ cần ôn</span>
        </p>
        <p className="mt-2 text-body-md text-on-surface-variant">
          {hasDue ? "Ôn ngắn mỗi ngày giúp bạn nhớ lâu hơn." : "Chưa có thẻ nào đến hạn. Lưu từ khi xem trước một bài để bắt đầu ôn."}
        </p>
      </div>
      <dl className="mt-space-md grid grid-cols-2 gap-space-sm">
        <div className="rounded-2xl bg-surface-container-low p-space-sm"><dt className="text-label-md text-on-surface-variant">Từ đã lưu</dt><dd className="font-serif text-headline-lg text-on-surface">{state.saved.length}</dd></div>
        <div className="rounded-2xl bg-surface-container-low p-space-sm"><dt className="text-label-md text-on-surface-variant">Bài đã mở</dt><dd className="font-serif text-headline-lg text-on-surface">{songs}</dd></div>
      </dl>
      <Link
        href={hasDue ? "/review" : "/library"}
        className={`mt-space-md inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-label-md font-semibold ${hasDue ? "bg-primary text-on-primary hover:bg-primary-container" : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"}`}
      >
        <Icon name={hasDue ? "style" : "library_music"} size={20} />
        {hasDue ? "Bắt đầu ôn" : "Mở thư viện"}
      </Link>
    </section>
  );
}
