"use client";

import { useEffect, useState } from "react";
import type { MoodGroupId } from "@/lib/library/mood-groups";

/** Nhóm cảm xúc của các bài (theo videoId). Rỗng khi chưa tải xong hoặc lỗi: giao diện coi như chưa có dữ liệu và ẩn bộ lọc cảm xúc. */
export function useSongMoods(videoIds: string[]): Record<string, MoodGroupId[]> {
  const key = [...new Set(videoIds)].sort().join(",");
  const [moods, setMoods] = useState<{ key: string; map: Record<string, MoodGroupId[]> }>({ key: "", map: {} });
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/songs/moods?ids=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { moods?: Record<string, MoodGroupId[]> } | null) => { if (!cancelled && d?.moods) setMoods({ key, map: d.moods }); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [key]);
  return moods.key === key ? moods.map : {};
}
