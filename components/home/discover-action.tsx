"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Icon } from "@/components/ui/icon";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useRecentSongs } from "./use-recent-songs";
import { useRecommendedSongs } from "./use-home-data";

const cta = "mt-space-md inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 text-label-md font-semibold bg-primary text-on-primary hover:bg-primary-container";

/**
 * Hành động "Hôm nay" khi người dùng chưa có thẻ đến hạn hay bài nghe dở: đề xuất sẵn một bài hợp level, bấm "Học ngay" là vào học,
 * không phải tự tìm hay dán link. Chưa có bài gợi ý nào (kho trống) thì trỏ về trang Khám phá.
 */
export function DiscoverAction() {
  const { state } = useLearnerState();
  const { songs: recent } = useRecentSongs();
  const openedIds = useMemo(() => (recent === null ? null : recent.map((s) => s.videoId)), [recent]);
  const songs = useRecommendedSongs(state.level, openedIds);
  const pick = songs?.[0];

  if (songs === undefined) return <div role="status" aria-label="Đang tìm bài cho bạn" className="mt-space-sm h-24 animate-pulse rounded-2xl bg-surface-container-high motion-reduce:animate-none" />;
  if (!pick) {
    return (
      <>
        <p className="mt-space-sm font-serif text-headline-md text-on-surface">Chưa biết học bài nào?</p>
        <p className="mt-2 text-body-md text-on-surface-variant">Chọn một bài đã có sẵn hoặc dán link bài bạn thích ở bên cạnh.</p>
        <Link href="/library?tab=discover" className={cta}><Icon name="library_music" size={20} />Xem bài gợi ý</Link>
      </>
    );
  }
  return (
    <>
      <p className="mt-space-sm text-body-md text-on-surface-variant">Bài gợi ý cho bạn hôm nay</p>
      <p lang="zh" className="line-clamp-2 font-serif text-headline-md text-on-surface">{pick.title}</p>
      <p className="mt-1 text-label-md text-on-surface-variant">{[pick.channelTitle, pick.levelAvg !== null ? `HSK ~${pick.levelAvg.toFixed(1)}` : null].filter(Boolean).join(" · ")}</p>
      <Link href={`/learn/${pick.videoId}`} className={cta}><Icon name="play_arrow" filled size={20} />Học ngay</Link>
    </>
  );
}
