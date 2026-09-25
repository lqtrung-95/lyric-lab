"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";
import { Icon } from "@/components/ui/icon";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";

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
              <Link
                href={`/learn/${song.videoId}`}
                className="group block overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(30,26,22,0.06)] transition-shadow hover:shadow-[0_4px_16px_rgba(30,26,22,0.1)]"
              >
                <div className="relative aspect-video bg-surface-container-high">
                  <Image src={videoThumbnailUrl(song.videoId, "mqdefault")} alt="" fill sizes="(min-width:1024px) 25vw, 50vw" className="object-cover" />
                  <span className="absolute bottom-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
                    <Icon name="play_arrow" filled size={20} />
                  </span>
                </div>
                <div className="p-space-md">
                  <p className="line-clamp-2 text-body-md font-medium text-on-surface">{song.title}</p>
                  <p className="mt-1 truncate text-label-md text-on-surface-variant">{song.channelTitle}</p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
