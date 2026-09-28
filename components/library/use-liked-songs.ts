"use client";

import { useCallback, useEffect, useState } from "react";
import { listLikedVideoIds } from "@/lib/user-data/song-likes-repo";

/** Tập videoId người dùng đã thích, tải một lần lúc mount; `setLiked` cập nhật cục bộ khi bấm nút tim (đã lạc quan ở SongLikeButton). */
export function useLikedSongs() {
  const [liked, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    listLikedVideoIds().then((ids) => { if (!cancelled) setLikedIds(new Set(ids)); });
    return () => { cancelled = true; };
  }, []);

  const setLiked = useCallback((videoId: string, value: boolean) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (value) next.add(videoId);
      else next.delete(videoId);
      return next;
    });
  }, []);

  return { liked, setLiked };
}
