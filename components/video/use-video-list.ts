"use client";

import { useEffect, useState } from "react";
import type { LessonSummary } from "@/lib/video/video-repo";

/** Tải danh sách video đã duyệt một lần: null = đang tải, "error" = lỗi. Dùng chung cho trang Video và trang từng kênh. */
export function useVideoList() {
  const [videos, setVideos] = useState<LessonSummary[] | null | "error">(null);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/videos")
      .then(async (r) => (r.ok ? ((await r.json()) as { videos: LessonSummary[] }).videos : Promise.reject(new Error("videos"))))
      .then((v) => { if (!cancelled) setVideos(v); })
      .catch(() => { if (!cancelled) setVideos("error"); });
    return () => { cancelled = true; };
  }, []);
  return videos;
}
