"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { SongCard } from "@/components/library/song-card";
import { Spinner } from "@/components/ui/spinner";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useRecommendedSongs } from "./use-home-data";

const noop = () => () => {};
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
};

/** Hàng "Gợi ý cho bạn": bài đã được phân tích sẵn, chọn theo level của người dùng (mở là học được ngay). Ẩn khi không có bài nào. */
export function RecommendedSongs() {
  const { state } = useLearnerState();
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);
  const openedIds = useMemo(() => parseRecentSongs(recentRaw).map((s) => s.videoId), [recentRaw]);
  const songs = useRecommendedSongs(state.level, openedIds);

  if (songs !== undefined && songs.length === 0) return null;
  return (
    <section aria-labelledby="recommended-heading" className="mt-space-xl">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="recommended-heading" className="font-serif text-headline-md text-on-surface">Gợi ý cho bạn</h2>
        <Link href="/library?tab=discover" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">Xem tất cả</Link>
      </div>
      {songs === undefined ? (
        <p role="status" className="mt-space-md flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tìm bài phù hợp với bạn…</p>
      ) : (
        <ul className="mt-space-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {songs.map((s) => (
            <li key={s.videoId}>
              <SongCard
                videoId={s.videoId} title={s.title} channelTitle={s.channelTitle} sizes="(min-width:1024px) 25vw, 50vw"
                meta={[s.levelAvg !== null ? `HSK ~${s.levelAvg.toFixed(1)}` : null, s.listeners > 0 ? `${s.listeners} người đã nghe` : null].filter(Boolean).join(" · ")}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
