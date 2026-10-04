"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { mergeLibrarySongs, type LibrarySong, type RemoteSongProgress } from "@/lib/library/merge-library-songs";
import { RECENT_SONGS_KEY, parseRecentSongs } from "@/lib/user-state/recent-songs";

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

/**
 * Bài gần đây của người dùng, mới nhất trước: bài đã nghe lưu trên tài khoản (theo người dùng qua mọi thiết bị) gộp với
 * bài mới mở xem trước lưu trong trình duyệt này. `songs` là null khi chưa biết phần trên tài khoản (đang tải), để
 * nơi dùng không nhấp nháy giữa "trống" và "có bài". `reload` tải lại phần trên tài khoản sau khi xóa/hoàn tác một bài.
 */
export function useRecentSongs(): { songs: LibrarySong[] | null; reload: () => void } {
  const [remote, setRemote] = useState<RemoteSongProgress[] | null>(null);
  const localRaw = useSyncExternalStore(subscribe, readRaw, () => null);

  const reload = useCallback(() => {
    fetch("/api/library/songs")
      .then((r) => (r.ok ? r.json() : { songs: [] }))
      .then((d: { songs?: RemoteSongProgress[] }) => setRemote(d.songs ?? []), () => setRemote([]));
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const songs = useMemo(() => (remote === null ? null : mergeLibrarySongs(remote, parseRecentSongs(localRaw))), [remote, localRaw]);
  return { songs, reload };
}
