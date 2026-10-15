"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/icon";
import { toggleSongLike } from "@/lib/user-data/song-likes-repo";

interface ListenLikeButtonProps {
  videoId: string;
  liked: boolean;
  onChange: (liked: boolean) => void;
  /** Hàm ghi thích/bỏ thích (mặc định cho bài hát); video luyện nghe truyền `toggleVideoLike`. */
  toggle?: (videoId: string, liked: boolean) => Promise<boolean>;
  /** Danh từ trong nhãn trợ năng: "bài" (mặc định) hoặc "video". */
  noun?: string;
}

/** Nút thích bài, kiểu nút dạng viên thuốc giống pinyin/bản dịch cạnh nó — dùng cho thanh công cụ nền sáng (khác SongLikeButton, làm cho ảnh bìa nền tối). */
export function ListenLikeButton({ videoId, liked, onChange, toggle: write = toggleSongLike, noun = "bài" }: ListenLikeButtonProps) {
  const [pending, setPending] = useState(false);

  async function toggle() {
    const next = !liked;
    onChange(next);
    setPending(true);
    const actual = await write(videoId, next);
    setPending(false);
    if (actual !== next) onChange(actual);
  }

  return (
    <button
      type="button" data-tour="like" onClick={() => void toggle()} disabled={pending} aria-pressed={liked}
      aria-label={liked ? `Bỏ thích ${noun} này` : `Thích ${noun} này`}
      className={`inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-3 text-label-md transition-colors disabled:opacity-70 ${
        liked ? "bg-surface-container-high text-error" : "text-on-surface-variant hover:bg-surface-container"
      }`}
    >
      <Icon name={liked ? "favorite" : "favorite_border"} filled={liked} size={18} />
      <span className="hidden sm:inline">Thích</span>
    </button>
  );
}
