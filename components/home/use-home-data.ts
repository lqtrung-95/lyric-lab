"use client";

import { useEffect, useState } from "react";
import type { DiscoverSong } from "@/lib/discover/discover-query";
import { levelToBand, pickContinueSong, type ContinueSong } from "@/lib/home/home-logic";
import type { RemoteSongProgress } from "@/lib/library/merge-library-songs";

/** Bài đang nghe dở gần nhất của người dùng (từ tiến độ đã lưu trên tài khoản); undefined = đang tải, null = không có. */
export function useContinueSong(): ContinueSong | null | undefined {
  const [song, setSong] = useState<ContinueSong | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/library/songs")
      .then((r) => (r.ok ? r.json() : { songs: [] }))
      .then((d: { songs?: RemoteSongProgress[] }) => { if (!cancelled) setSong(pickContinueSong(d.songs ?? [])); })
      .catch(() => { if (!cancelled) setSong(null); });
    return () => { cancelled = true; };
  }, []);
  return song;
}

const MAX_RECOMMENDED = 4;

async function fetchDiscover(params: Record<string, string>): Promise<DiscoverSong[]> {
  try {
    const res = await fetch(`/api/discover?${new URLSearchParams(params)}`);
    return res.ok ? ((await res.json()) as { songs: DiscoverSong[] }).songs : [];
  } catch {
    return [];
  }
}

/**
 * Bài gợi ý theo level của người dùng: ưu tiên bài phổ biến trong dải trình độ, thiếu thì bù bằng bài phổ biến chung.
 * Bỏ các bài người dùng đã mở gần đây. undefined = đang tải.
 */
export function useRecommendedSongs(level: number, excludeIds: string[]): DiscoverSong[] | undefined {
  const [songs, setSongs] = useState<DiscoverSong[] | undefined>(undefined);
  const excludeKey = excludeIds.join(",");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const skip = new Set(excludeKey ? excludeKey.split(",") : []);
      const pick = (list: DiscoverSong[]) => list.filter((s) => !skip.has(s.videoId));
      let result = pick(await fetchDiscover({ sort: "popular", band: levelToBand(level) }));
      if (result.length < MAX_RECOMMENDED) {
        const more = pick(await fetchDiscover({ sort: "popular" })).filter((s) => !result.some((r) => r.videoId === s.videoId));
        result = [...result, ...more];
      }
      if (!cancelled) setSongs(result.slice(0, MAX_RECOMMENDED));
    })();
    return () => { cancelled = true; };
  }, [level, excludeKey]);

  return songs;
}
