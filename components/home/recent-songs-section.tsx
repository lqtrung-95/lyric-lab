"use client";

import { SongCard } from "@/components/library/song-card";
import { SongLikeButton } from "@/components/library/song-like-button";
import { useLikedSongs } from "@/components/library/use-liked-songs";
import { useSongRemoval } from "@/components/library/use-song-removal";
import { useRecentSongs } from "./use-recent-songs";

/** Bài hát gần đây: bài đã nghe (theo tài khoản, đồng bộ mọi thiết bị) gộp với bài mới xem trước (trong trình duyệt). */
export function RecentSongsSection() {
  const { songs: all, reload } = useRecentSongs();
  const songs = all?.slice(0, 8) ?? [];
  const { remove, toast, dialog } = useSongRemoval(reload);
  const { liked, setLiked } = useLikedSongs();

  // Chưa mở bài nào thì bỏ phần này (NewcomerSteps và gợi ý đã đảm nhận), tránh một khối "trống".
  if (songs.length === 0) return null;
  return (
    <section aria-labelledby="recent-heading" className="mt-space-xl">
      <h2 id="recent-heading" className="font-serif text-headline-md text-on-surface">Bài hát gần đây</h2>
      <ul className="mt-space-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
        {songs.map((song) => (
          <li key={song.videoId}>
            <SongCard
              videoId={song.videoId} title={song.title} channelTitle={song.channelTitle} sizes="(min-width:1024px) 25vw, 50vw"
              onRemove={() => remove(song.videoId, song.title)}
              likeButton={<SongLikeButton videoId={song.videoId} liked={liked.has(song.videoId)} onChange={(v) => setLiked(song.videoId, v)} />}
            />
          </li>
        ))}
      </ul>
      {dialog}
    {toast}
    </section>
  );
}
