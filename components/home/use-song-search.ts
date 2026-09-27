"use client";

import { useEffect, useState } from "react";
import { normalizeSearchQuery, type SearchResponse } from "@/lib/search/search-types";

export type SongSearchState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "done"; data: SearchResponse }
  | { status: "unavailable"; data: SearchResponse }
  | { status: "error" };

const DEBOUNCE_MS = 400;

/** Tìm bài hát theo từ khóa (đợi người dùng ngừng gõ 0,4 giây, hủy yêu cầu cũ). `query` rỗng hoặc quá ngắn → idle. */
export function useSongSearch(query: string): SongSearchState {
  const q = normalizeSearchQuery(query);
  const [result, setResult] = useState<{ q: string; state: SongSearchState } | null>(null);

  useEffect(() => {
    if (!q) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal });
        const body = (await res.json()) as SearchResponse;
        setResult({ q, state: res.ok ? { status: "done", data: body } : res.status === 503 ? { status: "unavailable", data: { library: body.library ?? [], youtube: [] } } : { status: "error" } });
      } catch (e) {
        if ((e as Error).name !== "AbortError") setResult({ q, state: { status: "error" } });
      }
    }, DEBOUNCE_MS);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);

  if (!q) return { status: "idle" };
  return result?.q === q ? result.state : { status: "loading" };
}
