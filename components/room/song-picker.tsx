"use client";

import { useEffect, useId, useState } from "react";
import type { DiscoverSong } from "@/lib/discover/discover-query";

const DEBOUNCE_MS = 250;

/**
 * Chọn bài cho phòng: tìm trong các bài đã phân tích (cùng nguồn với tab Khám phá). Nhấn lại bài đang chọn thì bỏ chọn.
 * Bài chưa đủ dữ liệu cho phòng sẽ bị máy chủ từ chối lúc tạo phòng và người dùng được báo để chọn bài khác.
 */
export function SongPicker({ selected, onSelect }: { selected: string | null; onSelect: (videoId: string | null) => void }) {
  const id = useId();
  const [query, setQuery] = useState("");
  const [songs, setSongs] = useState<DiscoverSong[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      fetch(`/api/discover?sort=popular&q=${encodeURIComponent(query.trim())}`)
        .then((r) => (r.ok ? r.json() : { songs: [] }))
        .then((d: { songs?: DiscoverSong[] }) => { if (!cancelled) setSongs(d.songs ?? []); })
        .catch(() => { if (!cancelled) setSongs([]); });
    }, DEBOUNCE_MS);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [query]);

  return (
    <div>
      <label htmlFor={id} className="sr-only">Tìm bài hát đã phân tích</label>
      <input
        id={id} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Tìm theo tên bài hát…"
        className="min-h-11 w-full rounded-xl bg-surface-container-high px-4 text-body-md text-on-surface placeholder:text-on-surface-variant/70"
      />
      <ul aria-label="Bài hát" className="mt-2 max-h-56 space-y-1 overflow-y-auto pr-1">
        {songs === null && <li role="status" className="px-2 py-3 text-label-md text-on-surface-variant">Đang tải…</li>}
        {songs?.length === 0 && <li className="px-2 py-3 text-label-md text-on-surface-variant">Không có bài nào khớp.</li>}
        {songs?.map((song) => {
          const on = song.videoId === selected;
          return (
            <li key={song.videoId}>
              <button
                type="button" aria-pressed={on} onClick={() => onSelect(on ? null : song.videoId)}
                className={`flex min-h-12 w-full items-center gap-3 rounded-xl px-3 text-left transition-colors ${on ? "bg-primary/10 ring-1 ring-primary" : "hover:bg-surface-container-high"}`}
              >
                <span className="min-w-0 flex-1">
                  <span lang="zh" className="block truncate text-body-md font-medium text-on-surface">{song.title}</span>
                  <span className="block truncate text-label-sm text-on-surface-variant">{song.channelTitle}</span>
                </span>
                {on && <span className="text-label-sm font-semibold text-primary">Đã chọn</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
