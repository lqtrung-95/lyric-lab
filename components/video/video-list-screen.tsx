"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SongCard } from "@/components/library/song-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { LessonSummary } from "@/lib/video/video-repo";

const meta = (v: LessonSummary) =>
  [v.levelAvg !== null ? `HSK ~${v.levelAvg.toFixed(1)}` : null, `${v.lineCount} câu`, `${Math.max(1, Math.round(v.durationSec / 60))} phút`].filter(Boolean).join(" · ");

/** Trang Video: các video luyện nghe đã được tuyển chọn, bấm vào để xem cùng bản chép và tra từ. */
export function VideoListScreen() {
  const [videos, setVideos] = useState<LessonSummary[] | null | "error">(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/videos")
      .then(async (r) => (r.ok ? ((await r.json()) as { videos: LessonSummary[] }).videos : Promise.reject(new Error("videos"))))
      .then((v) => { if (!cancelled) setVideos(v); })
      .catch(() => { if (!cancelled) setVideos("error"); });
    return () => { cancelled = true; };
  }, []);

  return (
    <div className="space-y-space-md">
      <header>
        <h1 className="font-serif text-headline-lg-mobile md:text-headline-lg">Video luyện nghe</h1>
        <p className="mt-1 max-w-2xl text-body-lg text-on-surface-variant">Xem video tiếng Trung có phụ đề từng câu kèm pinyin và bản dịch. Bấm vào một từ để tra nghĩa và lưu vào bộ thẻ ôn.</p>
        <Link href="/video/add" className="mt-3 inline-flex min-h-11 items-center rounded-full bg-primary-container px-5 text-label-md font-semibold text-on-primary-container hover:bg-primary hover:text-on-primary">Thêm video của bạn</Link>
      </header>
      {videos === null ? (
        <ul role="status" aria-label="Đang tải video" className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => <li key={i}><Skeleton className="aspect-video w-full" /><Skeleton className="mt-2 h-12 w-full" /></li>)}
        </ul>
      ) : videos === "error" ? (
        <p role="alert" className="rounded-xl bg-error-container p-3 text-label-md text-on-error-container">Chưa tải được danh sách video, thử lại sau nhé.</p>
      ) : videos.length === 0 ? (
        <p className="rounded-2xl bg-surface-container-low p-space-lg text-center text-body-lg text-on-surface-variant">Chưa có video nào. Quay lại sau nhé.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-4">
          {videos.map((v) => (
            <li key={v.videoId}>
              <SongCard videoId={v.videoId} href={`/video/${v.videoId}`} title={v.title} channelTitle={v.channelTitle} meta={meta(v)} sizes="(min-width:1024px) 25vw, 50vw" />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
