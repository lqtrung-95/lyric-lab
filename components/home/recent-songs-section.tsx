"use client";

import { useMemo, useSyncExternalStore } from "react";
import { SongCard } from "@/components/library/song-card";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener("lyric-lab-recent-songs", onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener("lyric-lab-recent-songs", onChange);
  };
}
function readRaw() {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
}

/** Bài học gần đây (lưu trong trình duyệt). */
export function RecentSongsSection() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const songs = useMemo(() => parseRecentSongs(raw).slice(0, 8), [raw]);

  // Chưa mở bài nào thì bỏ phần này (NewcomerSteps và gợi ý đã đảm nhận), tránh một khối "trống".
  if (songs.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading" className="mt-space-xl">
      <h2 id="recent-heading" className="font-serif text-headline-md text-on-surface">Bài hát gần đây</h2>
      <ul className="mt-space-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {songs.map((song) => (
          <li key={song.videoId}>
            <SongCard videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} sizes="(min-width:1024px) 25vw, 50vw" />
          </li>
        ))}
      </ul>
    </section>
  );
}
