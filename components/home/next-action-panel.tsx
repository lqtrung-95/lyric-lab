"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useReviewSummaryState } from "@/components/review/use-review-summary";
import { chooseNextAction, formatPosition } from "@/lib/home/home-logic";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { DailyGoalRing } from "./daily-goal-ring";
import { DiscoverAction } from "./discover-action";
import { useContinueSong } from "./use-home-data";

const noop = () => () => {};
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
};
const DEFAULT_PER_DAY = 15;
const pulse = "animate-pulse bg-surface-container-high motion-reduce:animate-none";
const cta = "mt-space-md inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-label-md font-semibold";

/**
 * Bảng "Hôm nay": một hành động nổi bật duy nhất (ôn thẻ đến hạn → tiếp tục nghe bài dở → xem bài gợi ý),
 * vòng tròn mục tiêu thẻ mới trong ngày và hai số nhỏ về tiến độ.
 */
export function NextActionPanel() {
  const { summary, loaded } = useReviewSummaryState();
  const continueSong = useContinueSong();
  const { state } = useLearnerState();
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);
  const openedSongs = useMemo(() => parseRecentSongs(recentRaw).length, [recentRaw]);
  // Chờ cả hai nguồn (số thẻ đến hạn và bài đang nghe dở) rồi mới chọn hành động: hiện khung chờ cùng kích thước thay vì nhảy nội dung.
  const ready = loaded && continueSong !== undefined;
  const action = chooseNextAction({ due: summary?.total ?? 0, continueSong: continueSong ?? null });

  return (
    <section aria-labelledby="today-heading" aria-busy={!ready} className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-space-lg shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
      <div className="min-h-[12.5rem]">
        <h2 id="today-heading" className="text-label-md font-semibold uppercase tracking-widest text-secondary">Hôm nay</h2>
        {!ready && <ActionSkeleton />}
        {ready && action.kind === "review" && (
          <>
            <p className="mt-space-sm flex items-baseline gap-2">
              <span className="font-serif text-[56px] font-semibold leading-none text-primary">{action.due}</span>
              <span className="text-body-lg text-on-surface-variant">thẻ cần ôn</span>
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">Ôn ngắn mỗi ngày giúp bạn nhớ lâu hơn.</p>
            <Link href="/review" className={`${cta} bg-primary text-on-primary hover:bg-primary-container`}><Icon name="style" size={20} />Bắt đầu ôn</Link>
          </>
        )}
        {ready && action.kind === "continue" && (
          <>
            <p className="mt-space-sm text-body-md text-on-surface-variant">Bạn đang nghe dở</p>
            <p className="line-clamp-2 font-serif text-headline-md text-on-surface">{action.song.title}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Dừng ở {formatPosition(action.song.positionSec)}</p>
            <Link href={`/learn/${action.song.videoId}/listen?t=${action.song.positionSec}`} className={`${cta} bg-primary text-on-primary hover:bg-primary-container`}>
              <Icon name="play_arrow" filled size={20} />Tiếp tục nghe
            </Link>
          </>
        )}
        {ready && action.kind === "discover" && <DiscoverAction />}
      </div>

      <div className="mt-space-lg border-t border-outline-variant/40 pt-space-md">
        {loaded ? (
          <DailyGoalRing started={summary?.newStartedToday ?? 0} perDay={summary?.newPerDay ?? DEFAULT_PER_DAY} />
        ) : (
          <div aria-hidden="true" className="flex h-16 items-center gap-3">
            <div className={`h-16 w-16 shrink-0 rounded-full ${pulse}`} />
            <div className="space-y-2"><div className={`h-5 w-20 rounded-full ${pulse}`} /><div className={`h-3 w-28 rounded-full ${pulse}`} /></div>
          </div>
        )}
        <dl className="mt-space-md grid grid-cols-2 gap-space-sm text-label-md text-on-surface-variant">
          <div><dt>Từ đã lưu</dt><dd className="font-serif text-headline-md text-on-surface">{state.saved.length}</dd></div>
          <div><dt>Bài đã mở</dt><dd className="font-serif text-headline-md text-on-surface">{openedSongs}</dd></div>
        </dl>
      </div>
    </section>
  );
}

/** Khung chờ của phần hành động: cùng chiều cao với các trạng thái thật (tiêu đề, hai dòng mô tả, nút) để không nhảy bố cục. */
function ActionSkeleton() {
  return (
    <div role="status" className="mt-space-sm">
      <span className="sr-only">Đang tải…</span>
      <div aria-hidden="true">
        <div className={`h-9 w-3/4 rounded-full ${pulse}`} />
        <div className={`mt-3 h-4 w-full rounded-full ${pulse}`} />
        <div className={`mt-2 h-4 w-5/6 rounded-full ${pulse}`} />
        <div className={`mt-space-md h-12 w-44 rounded-full ${pulse}`} />
      </div>
    </div>
  );
}
