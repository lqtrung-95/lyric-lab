"use client";

import { useEffect, useState } from "react";
import type { MoodGroupId } from "@/lib/library/mood-groups";

/**
 * Nhóm cảm xúc của các bài (theo videoId). Rỗng khi chưa tải lần nào hoặc lỗi: giao diện coi như chưa có dữ liệu và ẩn bộ lọc cảm xúc.
 * Danh sách bài đổi (bài lưu cục bộ hiện trước, danh sách từ server về sau) thì giữ nguyên dữ liệu đã có và gộp thêm bài mới khi tải xong,
 * không trả về rỗng giữa chừng, nếu không hàng chip sẽ biến mất rồi hiện lại (nhấp nháy).
 */
export function useSongMoods(videoIds: string[]): Record<string, MoodGroupId[]> {
  const key = [...new Set(videoIds)].sort().join(",");
  const [moods, setMoods] = useState<Record<string, MoodGroupId[]>>({});
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/songs/moods?ids=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { moods?: Record<string, MoodGroupId[]> } | null) => { if (!cancelled && d?.moods) setMoods((prev) => ({ ...prev, ...d.moods })); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [key]);
  return moods;
}
