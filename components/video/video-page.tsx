"use client";

import { VideoLessonLoader } from "./video-lesson-loader";
import { VideoStudyScreen } from "./video-study-screen";

/** Trang học một video (xem phụ đề, nghe – chép, luyện nói), tải video rồi dựng màn học. `tab` là giá trị `?tab=` của địa chỉ. */
export function VideoPage({ videoId, startAt, tab }: { videoId: string; startAt?: number; tab?: string }) {
  return <VideoLessonLoader videoId={videoId}>{(lesson) => <VideoStudyScreen lesson={lesson} startAt={startAt} initialTab={tab} />}</VideoLessonLoader>;
}
