"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { SongCard } from "./song-card";
import { useSongRemoval } from "./use-song-removal";
import { mergeLibrarySongs, type RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";

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

  const load = useCallback(() => {
    fetch("/api/library/songs").then((r) => r.json()).then((d) => setRemote(d.songs ?? []), () => setRemote([]));
  }, []);
  useEffect(() => { load(); }, [load]);
  const { remove, toast } = useSongRemoval(load);

  const songs = useMemo(() => mergeLibrarySongs(remote ?? [], parseRecentSongs(recentRaw)), [remote, recentRaw]);

  if (remote === null && songs.length === 0) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải…</p>;
  if (songs.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
        Chưa có bài nào. <Link href="/app" className="font-medium text-primary underline">Dán link YouTube</Link> để bắt đầu bài học đầu tiên.
      </p>
    );
  }
  return (
    <>
    <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <li key={song.videoId}>
          <SongCard
            videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} sizes="(min-width:1024px) 33vw, 50vw"
            onRemove={() => remove(song.videoId, song.title)}
            progress={{ fraction: song.progress, label: song.completed ? "Đã nghe hết" : song.progress > 0 ? `${Math.round(song.progress * 100)}%` : "Chưa nghe" }}
          />
        </li>
      ))}
    </ul>
    {toast}
    </>
  );
}
