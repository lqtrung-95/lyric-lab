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

/** Bài học gần đây (localStorage, tới khi có tài khoản ở M3). */
export function RecentSongsSection() {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const songs = useMemo(() => parseRecentSongs(raw).slice(0, 8), [raw]);

  return (
    <section aria-labelledby="recent-heading" className="mt-space-xl">
      <h2 id="recent-heading" className="font-serif text-headline-md text-on-surface">
        Bài hát gần đây
      </h2>
      {songs.length === 0 ? (
        <p className="mt-space-md rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
          Chưa có bài nào. Dán link YouTube ở trên để bắt đầu bài học đầu tiên.
        </p>
      ) : (
        <ul className="mt-space-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {songs.map((song) => (
            <li key={song.videoId}>
              <SongCard videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} sizes="(min-width:1024px) 25vw, 50vw" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
