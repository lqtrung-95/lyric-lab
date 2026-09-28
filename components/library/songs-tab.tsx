"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { SelectField } from "@/components/ui/select-field";
import { SongCard } from "./song-card";
import { SongLikeButton } from "./song-like-button";
import { useLikedSongs } from "./use-liked-songs";
import { useSongRemoval } from "./use-song-removal";
import { mergeLibrarySongs, type LibrarySong, type RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";

const noop = () => () => {};
const readRecent = () => {
  try {
    return localStorage.getItem(RECENT_SONGS_KEY);
  } catch {
    return null;
  }
};

type StatusFilter = "all" | "in_progress" | "completed" | "not_started" | "liked";

const matchesStatus = (song: LibrarySong, status: StatusFilter, liked: Set<string>): boolean => {
  if (status === "all") return true;
  if (status === "liked") return liked.has(song.videoId);
  if (status === "completed") return song.completed;
  if (status === "not_started") return !song.completed && song.progress === 0;
  return !song.completed && song.progress > 0;
};

/** Tab "Bài hát" (AC-03): bài đã nghe kèm tiến độ và bài mới xem trước, mới nhất trước. Tìm theo tên/kênh, lọc theo trạng thái nghe. */
export function SongsTab() {
  const [remote, setRemote] = useState<RemoteSongProgress[] | null>(null);
  const recentRaw = useSyncExternalStore(noop, readRecent, () => null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const { liked, setLiked } = useLikedSongs();

  const load = useCallback(() => {
    fetch("/api/library/songs").then((r) => r.json()).then((d) => setRemote(d.songs ?? []), () => setRemote([]));
  }, []);
  useEffect(() => { load(); }, [load]);
  const { remove, toast, dialog } = useSongRemoval(load);

  const allSongs = useMemo(() => mergeLibrarySongs(remote ?? [], parseRecentSongs(recentRaw)), [remote, recentRaw]);
  const q = query.trim().toLowerCase();
  const songs = useMemo(
    () => allSongs.filter((s) => matchesStatus(s, status, liked) && (!q || s.title.toLowerCase().includes(q) || s.channelTitle.toLowerCase().includes(q))),
    [allSongs, status, q, liked],
  );

  if (remote === null && allSongs.length === 0) return <p role="status" className="py-space-lg text-body-md text-on-surface-variant">Đang tải…</p>;
  if (allSongs.length === 0) {
    return (
      <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">
        Chưa có bài nào. <Link href="/app" className="font-medium text-primary underline">Dán link YouTube</Link> để bắt đầu bài học đầu tiên.
      </p>
    );
  }
  return (
    <>
    <div className="mb-space-md flex flex-wrap items-center gap-space-sm">
      <label className="flex-1 basis-56">
        <span className="sr-only">Tìm bài hát của tôi theo tên</span>
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên bài hát…"
          className="min-h-11 w-full rounded-full bg-surface-container-high px-4 text-label-md text-on-surface" />
      </label>
      <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
        <span>Trạng thái</span>
        <SelectField value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
          <option value="all">Tất cả</option>
          <option value="in_progress">Đang nghe dở</option>
          <option value="completed">Đã nghe hết</option>
          <option value="not_started">Chưa nghe</option>
          <option value="liked">Đã thích</option>
        </SelectField>
      </label>
    </div>
    {songs.length === 0 ? (
      <p className="rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Không có bài nào khớp tìm kiếm/bộ lọc.</p>
    ) : (
    <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <li key={song.videoId}>
          <SongCard
            videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} sizes="(min-width:1024px) 33vw, 50vw"
            onRemove={() => remove(song.videoId, song.title)}
            likeButton={<SongLikeButton videoId={song.videoId} liked={liked.has(song.videoId)} onChange={(v) => setLiked(song.videoId, v)} />}
            progress={{ fraction: song.progress, label: song.completed ? "Đã nghe hết" : song.progress > 0 ? `${Math.round(song.progress * 100)}%` : "Chưa nghe" }}
          />
        </li>
      ))}
    </ul>
    )}
    {dialog}
    {toast}
    </>
  );
}
