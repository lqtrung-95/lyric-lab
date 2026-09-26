"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { useReviewSummary } from "@/components/review/use-review-summary";
import { chooseNextAction, formatPosition } from "@/lib/home/home-logic";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { DailyGoalRing } from "./daily-goal-ring";
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
const cta = "mt-space-md inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-label-md font-semibold";

/**
 * Bảng "Hôm nay": một hành động nổi bật duy nhất (ôn thẻ đến hạn → tiếp tục nghe bài dở → xem bài gợi ý),
 * vòng tròn mục tiêu thẻ mới trong ngày và hai số nhỏ về tiến độ.
 */
export function NextActionPanel() {
  const summary = useReviewSummary();
  const continueSong = useContinueSong();
  const { state } = useLearnerState();
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);
  const openedSongs = useMemo(() => parseRecentSongs(recentRaw).length, [recentRaw]);
  const action = chooseNextAction({ due: summary?.total ?? 0, continueSong: continueSong ?? null });

  return (
    <section aria-labelledby="today-heading" className="flex flex-col justify-between rounded-3xl bg-surface-container-lowest p-space-lg shadow-[0_1px_10px_rgba(30,26,22,0.06)]">
      <div>
        <h2 id="today-heading" className="text-label-md font-semibold uppercase tracking-widest text-secondary">Hôm nay</h2>
        {action.kind === "review" && (
          <>
            <p className="mt-space-sm flex items-baseline gap-2">
              <span className="font-serif text-[56px] font-semibold leading-none text-primary">{action.due}</span>
              <span className="text-body-lg text-on-surface-variant">thẻ cần ôn</span>
            </p>
            <p className="mt-2 text-body-md text-on-surface-variant">Ôn ngắn mỗi ngày giúp bạn nhớ lâu hơn.</p>
            <Link href="/review" className={`${cta} bg-primary text-on-primary hover:bg-primary-container`}><Icon name="style" size={20} />Bắt đầu ôn</Link>
          </>
        )}
        {action.kind === "continue" && (
          <>
            <p className="mt-space-sm text-body-md text-on-surface-variant">Bạn đang nghe dở</p>
            <p className="line-clamp-2 font-serif text-headline-md text-on-surface">{action.song.title}</p>
            <p className="mt-1 text-label-md text-on-surface-variant">Dừng ở {formatPosition(action.song.positionSec)}</p>
            <Link href={`/learn/${action.song.videoId}/listen?t=${action.song.positionSec}`} className={`${cta} bg-primary text-on-primary hover:bg-primary-container`}>
              <Icon name="play_arrow" filled size={20} />Tiếp tục nghe
            </Link>
          </>
        )}
        {action.kind === "discover" && (
          <>
            <p className="mt-space-sm font-serif text-headline-md text-on-surface">Chưa biết học bài nào?</p>
            <p className="mt-2 text-body-md text-on-surface-variant">Chọn một bài đã có sẵn, mở là học được ngay, hoặc dán link bài bạn thích ở bên cạnh.</p>
            <Link href="/library?tab=discover" className={`${cta} bg-primary text-on-primary hover:bg-primary-container`}><Icon name="library_music" size={20} />Xem bài gợi ý</Link>
          </>
        )}
      </div>

      <div className="mt-space-lg border-t border-outline-variant/40 pt-space-md">
        <DailyGoalRing started={summary?.newStartedToday ?? 0} perDay={summary?.newPerDay ?? DEFAULT_PER_DAY} />
        <dl className="mt-space-md grid grid-cols-2 gap-space-sm text-label-md text-on-surface-variant">
          <div><dt>Từ đã lưu</dt><dd className="font-serif text-headline-md text-on-surface">{state.saved.length}</dd></div>
          <div><dt>Bài đã mở</dt><dd className="font-serif text-headline-md text-on-surface">{openedSongs}</dd></div>
        </dl>
      </div>
    </section>
  );
}
