"use client";

import Link from "next/link";
import { useMemo } from "react";
import { SongCard } from "@/components/library/song-card";
import { useLearnerState } from "@/lib/user-state/use-learner-state";
import { useRecentSongs } from "./use-recent-songs";
import { useRecommendedSongs } from "./use-home-data";

/** Hàng "Gợi ý cho bạn": bài đã được phân tích sẵn, chọn theo level của người dùng (mở là học được ngay). Ẩn khi không có bài nào. */
export function RecommendedSongs() {
  const { state } = useLearnerState();
  const { songs: recent } = useRecentSongs();
  const openedIds = useMemo(() => (recent ?? []).map((s) => s.videoId), [recent]);
  const songs = useRecommendedSongs(state.level, openedIds);

  if (songs !== undefined && songs.length === 0) return null;
  return (
    <section aria-labelledby="recommended-heading" className="mt-space-xl">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="recommended-heading" className="font-serif text-headline-md text-on-surface">Gợi ý cho bạn</h2>
        <Link href="/library?tab=discover" className="inline-flex min-h-11 items-center text-label-md font-medium text-primary hover:underline">Xem tất cả</Link>
      </div>
      {songs === undefined ? (
        // Khung chờ cùng hình dạng thẻ bài hát để hàng không nhảy khi dữ liệu về.
        <div role="status" className="mt-space-md">
          <span className="sr-only">Đang tìm bài phù hợp với bạn…</span>
          <ul aria-hidden="true" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <li key={i} className="overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(30,26,22,0.06)]">
                <div className="aspect-video animate-pulse bg-surface-container-high motion-reduce:animate-none" />
                <div className="space-y-2 p-space-md">
                  <div className="h-4 w-11/12 animate-pulse rounded-full bg-surface-container-high motion-reduce:animate-none" />
                  <div className="h-4 w-2/3 animate-pulse rounded-full bg-surface-container-high motion-reduce:animate-none" />
                  <div className="h-3 w-1/2 animate-pulse rounded-full bg-surface-container-high motion-reduce:animate-none" />
                </div>
              </li>
            ))}
          </ul>
        </div>
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
