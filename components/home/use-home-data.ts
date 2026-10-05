"use client";

import { useEffect, useState } from "react";
import { DISCOVER_PAGE_SIZE, type DiscoverSong } from "@/lib/discover/discover-query";
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

interface DiscoverPage { songs: DiscoverSong[]; hasMore: boolean }

async function fetchDiscover(params: Record<string, string>): Promise<DiscoverPage> {
  try {
    const res = await fetch(`/api/discover?${new URLSearchParams(params)}`);
    return res.ok ? ((await res.json()) as DiscoverPage) : { songs: [], hasMore: false };
  } catch {
    return { songs: [], hasMore: false };
  }
}

/** Số trang Khám phá tối đa đọc cho mỗi nguồn (24 bài/trang): đủ vượt qua cả thư viện mà không gọi vô hạn. */
const MAX_PAGES = 6;

/** Đọc từng trang (đã xếp theo độ phổ biến) cho đến khi gom đủ `need` bài chưa bị loại hoặc hết trang. */
async function collectUnseen(params: Record<string, string>, skip: Set<string>, need: number): Promise<DiscoverSong[]> {
  const found: DiscoverSong[] = [];
  for (let page = 0; page < MAX_PAGES && found.length < need; page++) {
    const { songs, hasMore } = await fetchDiscover({ ...params, offset: String(page * DISCOVER_PAGE_SIZE) });
    for (const s of songs) if (!skip.has(s.videoId)) { skip.add(s.videoId); found.push(s); }
    if (!hasMore) break;
  }
  return found;
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
      // `skip` gồm bài đã mở và dồn thêm các bài đã chọn, để nguồn bù không lặp lại bài của dải trình độ.
      const skip = new Set(excludeKey ? excludeKey.split(",") : []);
      const inBand = await collectUnseen({ sort: "popular", band: levelToBand(level) }, skip, MAX_RECOMMENDED);
      const result = inBand.length >= MAX_RECOMMENDED ? inBand : [...inBand, ...(await collectUnseen({ sort: "popular" }, skip, MAX_RECOMMENDED - inBand.length))];
      if (!cancelled) setSongs(result.slice(0, MAX_RECOMMENDED));
    })();
    return () => { cancelled = true; };
  }, [level, excludeKey]);

  return songs;
}
