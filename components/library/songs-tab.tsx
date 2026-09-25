"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { mergeLibrarySongs, type RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";
import { videoThumbnailUrl } from "@/lib/youtube/video-thumbnail";

const noop = () => () => {};
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
};

/** Tab "Bài hát" (AC-03): bài đã nghe kèm tiến độ và bài mới xem trước, mới nhất trước. */
export function SongsTab() {
  const [remote, setRemote] = useState<RemoteSongProgress[] | null>(null);
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);

  useEffect(() => {
    fetch("/api/library/songs").then((r) => r.json()).then((d) => setRemote(d.songs ?? []), () => setRemote([]));
  }, []);

  const songs = useMemo(() => mergeLibrarySongs(remote ?? [], parseRecentSongs(recentRaw)), [remote, recentRaw]);

  if (remote === null && songs.length === 0) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải…</p>;
  if (songs.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
        Chưa có bài nào. <Link href="/" className="font-medium text-primary underline">Dán link YouTube</Link> để bắt đầu bài học đầu tiên.
      </p>
    );
  }
  return (
    <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <li key={song.videoId}>
          <Link href={`/learn/${song.videoId}`} className="group block overflow-hidden rounded-2xl bg-surface-container-lowest shadow-[0_1px_8px_rgba(30,26,22,0.06)] hover:shadow-[0_4px_16px_rgba(30,26,22,0.1)]">
            <div className="relative aspect-video bg-surface-container-high">
              <Image src={videoThumbnailUrl(song.videoId, "mqdefault")} alt="" fill sizes="(min-width:1024px) 33vw, 50vw" className="object-cover" />
            </div>
            <div className="p-space-md">
              <p className="line-clamp-2 text-body-md font-medium text-on-surface">{song.title}</p>
              <p className="mt-1 truncate text-label-md text-on-surface-variant">{song.channelTitle}</p>
              <div className="mt-space-sm flex items-center gap-2">
                <div role="progressbar" aria-label="Tiến độ nghe" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(song.progress * 100)} className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-container-highest">
                  <div className="h-full bg-primary" style={{ width: `${song.progress * 100}%` }} />
                </div>
                <span className="text-label-sm text-on-surface-variant">{song.completed ? "Đã nghe hết" : song.progress > 0 ? `${Math.round(song.progress * 100)}%` : "Chưa nghe"}</span>
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
