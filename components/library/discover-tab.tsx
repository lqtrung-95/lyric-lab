"use client";

import { useCallback, useEffect, useState } from "react";
import { SelectField } from "@/components/ui/select-field";
import { Spinner } from "@/components/ui/spinner";
import type { DiscoverSong } from "@/lib/discover/discover-query";
import { SongCard } from "./song-card";

const BANDS = [
  { value: "", label: "Mọi trình độ" },
  { value: "1-2", label: "HSK 1–2" },
  { value: "3-4", label: "HSK 3–4" },
  { value: "5-6", label: "HSK 5–6" },
  { value: "7", label: "HSK 7–9" },
];

interface Page { songs: DiscoverSong[]; hasMore: boolean }

const metaOf = (s: DiscoverSong) =>
  [s.levelAvg !== null ? `HSK ~${s.levelAvg.toFixed(1)}` : null, s.listeners > 0 ? `${s.listeners} người đã nghe` : null].filter(Boolean).join(" · ");

/** Tab "Khám phá": bài hát đã được phân tích (nên mở tức thì), lọc theo trình độ, mới nhất/phổ biến và tìm theo tên. */
export function DiscoverTab() {
  const [sort, setSort] = useState<"new" | "popular">("new");
  const [band, setBand] = useState("");
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const [songs, setSongs] = useState<DiscoverSong[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const load = useCallback(async (offset: number): Promise<Page | null> => {
    const params = new URLSearchParams({ sort, offset: String(offset) });
    if (band) params.set("band", band);
    if (debounced) params.set("q", debounced);
    try {
      const res = await fetch(`/api/discover?${params}`);
      return res.ok ? ((await res.json()) as Page) : null;
    } catch {
      return null;
    }
  }, [sort, band, debounced]);

  useEffect(() => {
    let cancelled = false;
    load(0).then((page) => {
      if (cancelled) return; // bộ lọc đã đổi trong lúc chờ: bỏ kết quả cũ
      if (!page) return setState("error");
      setSongs(page.songs);
      setHasMore(page.hasMore);
      setState("ready");
    });
    return () => { cancelled = true; };
  }, [load]);

  async function more() {
    setLoadingMore(true);
    const page = await load(songs.length);
    if (page) {
      setSongs((prev) => [...prev, ...page.songs.filter((s) => !prev.some((p) => p.videoId === s.videoId))]);
      setHasMore(page.hasMore);
    }
    setLoadingMore(false);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-space-sm">
        <label className="flex-1 basis-56">
          <span className="sr-only">Tìm bài hát theo tên</span>
          <input type="search" value={query} onChange={(e) => { setQuery(e.target.value); setState("loading"); }} placeholder="Tìm theo tên bài hát…"
            className="min-h-11 w-full rounded-full bg-surface-container-high px-4 text-label-md text-on-surface" />
        </label>
        <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span>Trình độ</span>
          <SelectField value={band} onChange={(e) => { setBand(e.target.value); setState("loading"); }}>
            {BANDS.map((b) => <option key={b.value} value={b.value}>{b.label}</option>)}
          </SelectField>
        </label>
        <label className="flex items-center gap-2 text-label-md text-on-surface-variant">
          <span>Sắp xếp</span>
          <SelectField value={sort} onChange={(e) => { setSort(e.target.value as "new" | "popular"); setState("loading"); }}>
            <option value="new">Mới nhất</option>
            <option value="popular">Phổ biến</option>
          </SelectField>
        </label>
      </div>
      <p className="mt-space-sm text-label-md text-on-surface-variant">Bài hát đã được người dùng khác phân tích: mở là học được ngay, không phải chờ.</p>

      {state === "loading" ? (
        <p role="status" className="mt-space-lg flex items-center gap-2 text-body-md text-on-surface-variant"><Spinner size={18} />Đang tải…</p>
      ) : state === "error" ? (
        <p role="alert" className="mt-space-lg text-body-md text-error">Chưa tải được danh sách. Thử lại sau nhé.</p>
      ) : songs.length === 0 ? (
        <p className="mt-space-lg rounded-2xl bg-surface-container-low p-space-lg text-body-md text-on-surface-variant">Chưa có bài nào khớp bộ lọc. Bạn thử bỏ bớt bộ lọc hoặc dán link một bài hát mới.</p>
      ) : (
        <>
          <ul className="mt-space-md grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
            {songs.map((s) => (
              <li key={s.videoId}><SongCard videoId={s.videoId} title={s.title} channelTitle={s.channelTitle} meta={metaOf(s)} sizes="(min-width:1024px) 33vw, 50vw" /></li>
            ))}
          </ul>
          {hasMore && (
            <div className="mt-space-lg text-center">
              <button type="button" onClick={more} disabled={loadingMore} aria-busy={loadingMore}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-surface-container-high px-6 text-label-md font-medium text-on-surface hover:bg-surface-container-highest disabled:opacity-70">
                {loadingMore && <Spinner size={16} />}Xem thêm
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
