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
const cta = "mt-space-sm inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-label-md font-semibold";

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
    <section aria-labelledby="today-heading" aria-busy={!ready} className="card-ink flex h-full flex-col justify-between p-space-md">
      <div className="min-h-[9.5rem]">
        <h2 id="today-heading" className="inline-block rounded-full border-2 border-ink bg-primary-container px-3 py-0.5 text-label-sm font-extrabold uppercase tracking-widest text-on-primary-container">Việc tiếp theo</h2>
        {!ready && <ActionSkeleton />}
        {ready && action.kind === "review" && (
          <>
            <p className="mt-space-sm flex items-baseline gap-2">
              <span className="font-serif text-[44px] font-semibold leading-none text-primary">{action.due}</span>
              <span className="text-body-lg text-on-surface-variant">thẻ cần ôn</span>
            </p>
                        <Link href="/review" className={`${cta} bg-primary text-on-primary hover:brightness-110`}><Icon name="style" size={20} />Bắt đầu ôn</Link>
          </>
        )}
        {ready && action.kind === "continue" && (
          <>
            <p className="mt-space-sm text-body-md text-on-surface-variant">Bạn đang nghe dở</p>
            <p className="line-clamp-2 font-serif text-headline-md text-on-surface">{action.song.title}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Dừng ở {formatPosition(action.song.positionSec)}</p>
            <Link href={`/learn/${action.song.videoId}/listen?t=${action.song.positionSec}`} className={`${cta} bg-primary text-on-primary hover:brightness-110`}>
              <Icon name="play_arrow" filled size={20} />Tiếp tục nghe
            </Link>
          </>
        )}
        {ready && action.kind === "discover" && <DiscoverAction />}
      </div>

      <div className="mt-space-sm flex flex-wrap items-center justify-between gap-x-space-md gap-y-2 border-t border-outline-variant/40 pt-space-sm">
        {loaded ? (
          <DailyGoalRing started={summary?.newStartedToday ?? 0} perDay={summary?.newPerDay ?? DEFAULT_PER_DAY} />
        ) : (
          <div aria-hidden="true" className="flex h-12 items-center gap-3">
            <div className={`size-12 shrink-0 rounded-full ${pulse}`} />
            <div className="space-y-2"><div className={`h-5 w-20 rounded-full ${pulse}`} /><div className={`h-3 w-28 rounded-full ${pulse}`} /></div>
          </div>
        )}
        <dl className="flex gap-space-md text-label-md text-on-surface-variant">
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
        <div className={`h-8 w-3/4 rounded-full ${pulse}`} />
        <div className={`mt-2 h-4 w-full rounded-full ${pulse}`} />
        <div className={`mt-space-sm h-11 w-44 rounded-full ${pulse}`} />
      </div>
    </div>
  );
}
