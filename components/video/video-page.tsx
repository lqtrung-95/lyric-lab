"use client";

import { VideoLessonLoader } from "./video-lesson-loader";
import { VideoStudyScreen } from "./video-study-screen";

/** Trang học một video (xem phụ đề, nghe – chép, luyện nói), tải video rồi dựng màn học. `tab` là giá trị `?tab=` của địa chỉ; `autoTranslate` (`?translate=auto`, đặt sau khi vừa thêm video còn câu chưa dịch) tự chạy dịch bù. */
export function VideoPage({ videoId, startAt, tab, autoTranslate }: { videoId: string; startAt?: number; tab?: string; autoTranslate?: boolean }) {
  return <VideoLessonLoader videoId={videoId}>{(lesson) => <VideoStudyScreen lesson={lesson} startAt={startAt} initialTab={tab} autoTranslate={autoTranslate} />}</VideoLessonLoader>;
}
