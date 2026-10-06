"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import type { LessonDetail } from "@/lib/video/video-repo";
import { VideoWatchScreen } from "./video-watch-screen";

/** Tải một video luyện nghe rồi hiện màn xem; 404 hoặc lỗi thì báo rõ thay vì trang trống. */
export function VideoPage({ videoId, startAt }: { videoId: string; startAt?: number }) {
  const [lesson, setLesson] = useState<LessonDetail | null | "missing" | "error">(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/videos/${videoId}`)
      .then(async (r): Promise<LessonDetail | "missing" | "error"> => (r.ok ? ((await r.json()) as LessonDetail) : r.status === 404 ? "missing" : "error"))
      .then((v) => { if (!cancelled) setLesson(v); })
      .catch(() => { if (!cancelled) setLesson("error"); });
    return () => { cancelled = true; };
  }, [videoId]);

  if (lesson === null) {
    return <div role="status" aria-label="Đang tải video" className="mx-auto max-w-3xl space-y-space-md p-gutter"><Skeleton className="aspect-video w-full" /><Skeleton className="h-40 w-full" /></div>;
  }
  if (lesson === "missing" || lesson === "error") {
    return (
      <div role="alert" className="mx-auto mt-space-xl max-w-md rounded-2xl bg-surface-container-low p-space-lg text-center">
        <h1 className="font-serif text-headline-md">{lesson === "missing" ? "Không tìm thấy video này" : "Chưa tải được video"}</h1>
        <p className="mt-1 text-body-md text-on-surface-variant">{lesson === "missing" ? "Video chưa được mở hoặc đã được gỡ." : "Kiểm tra kết nối rồi thử lại nhé."}</p>
        <Link href="/video" className="mt-space-md inline-flex min-h-11 items-center rounded-full bg-primary px-6 text-label-md font-semibold text-on-primary">Về danh sách video</Link>
      </div>
    );
  }
  return <VideoWatchScreen lesson={lesson} startAt={startAt} />;
}
