"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReportedSong } from "@/lib/admin/song-report-types";

/** Các bài đang bị báo sai (chỉ gọi khi đã biết là admin: `enabled`). undefined = đang tải; mảng rỗng = không có hoặc lỗi. `reload` tải lại. */
export function useSongReports(enabled: boolean, videoId?: string): { items: ReportedSong[] | undefined; reload: () => void } {
  const [items, setItems] = useState<ReportedSong[] | undefined>(undefined);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    fetch(`/api/admin/song-reports${videoId ? `?videoId=${videoId}` : ""}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : { items: [] }))
      .then((d: { items: ReportedSong[] }) => { if (!cancelled) setItems(d.items); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, [enabled, videoId, tick]);
  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { items, reload };
}
