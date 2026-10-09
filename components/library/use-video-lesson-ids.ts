"use client";

import { useEffect, useState } from "react";

/**
 * Trong các videoId đã cho, những id là bài học video (không phải bài hát). Chưa tải xong hoặc lỗi thì rỗng: link rơi về /learn/<id>,
 * trang đó tự chuyển sang /video/<id>, chỉ chậm hơn một bước.
 */
export function useVideoLessonIds(videoIds: string[]): Set<string> {
  const key = [...new Set(videoIds)].sort().join(",");
  const [found, setFound] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (!key) return;
    let cancelled = false;
    fetch(`/api/videos/lessons-among?ids=${encodeURIComponent(key)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d: { videoIds?: string[] } | null) => { if (!cancelled && d?.videoIds) setFound((prev) => new Set([...prev, ...d.videoIds!])); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [key]);
  return found;
}
