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
      // Đã thích thì luôn hiện (để thấy ngay bài mình thích); chưa thích thì chỉ hiện khi chạm/di chuột qua thẻ trên desktop,
      // đỡ rợp mắt vì mọi thẻ đều có icon tim thường trực.
      className={`flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white opacity-90 backdrop-blur-sm transition-opacity hover:bg-black/75 focus-visible:opacity-100 disabled:opacity-70 ${
        shown ? "" : "md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      }`}
    >
      <Icon name={shown ? "favorite" : "favorite_border"} filled={shown} size={18} className={shown ? "text-error" : undefined} />
    </button>
  );
}
