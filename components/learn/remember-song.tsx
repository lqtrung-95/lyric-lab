"use client";

import { useEffect } from "react";
import { RECENT_SONGS_KEY, addRecentSong, parseRecentSongs } from "@/lib/user-state/recent-songs";

/** Ghi bài vào danh sách "gần đây" (localStorage) khi mở trang bài học. Không hiển thị gì. */
export function RememberSong({ videoId, title, channelTitle }: { videoId: string; title: string; channelTitle: string }) {
  useEffect(() => {
    try {
      const list = parseRecentSongs(localStorage.getItem(RECENT_SONGS_KEY));
      localStorage.setItem(RECENT_SONGS_KEY, JSON.stringify(addRecentSong(list, { videoId, title, channelTitle, openedAt: Date.now() })));
      window.dispatchEvent(new Event("lyric-lab-recent-songs"));
    } catch {
      // localStorage bị chặn: bỏ qua, chỉ mất tính năng "gần đây".
    }
  }, [videoId, title, channelTitle]);
  return null;
}
