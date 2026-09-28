"use client";

import { useState, useTransition } from "react";
import { Icon } from "@/components/ui/icon";
import { toggleSongLike } from "@/lib/user-data/song-likes-repo";

interface SongLikeButtonProps {
  videoId: string;
  liked: boolean;
  /** Gọi ngay khi bấm (cập nhật lạc quan) rồi lại khi biết kết quả thật, để danh sách "Đã thích" lọc đúng. */
  onChange: (liked: boolean) => void;
}

/** Nút tim trên thẻ bài hát: bấm để thích/bỏ thích, cập nhật lạc quan rồi đồng bộ Supabase (`user_song_likes`). */
export function SongLikeButton({ videoId, liked, onChange }: SongLikeButtonProps) {
  const [pending, startTransition] = useTransition();
  const [optimistic, setOptimistic] = useState<boolean | null>(null);
  const shown = optimistic ?? liked;

  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !shown;
    setOptimistic(next);
    onChange(next);
    startTransition(async () => {
      const actual = await toggleSongLike(videoId, next);
      setOptimistic(null);
      if (actual !== next) onChange(actual);
    });
  }

  return (
    <button
      type="button" onClick={toggle} disabled={pending} aria-pressed={shown}
      aria-label={shown ? "Bỏ thích bài này" : "Thích bài này"}
      className="flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 disabled:opacity-70"
    >
      <Icon name={shown ? "favorite" : "favorite_border"} filled={shown} size={18} className={shown ? "text-error" : undefined} />
    </button>
  );
}
