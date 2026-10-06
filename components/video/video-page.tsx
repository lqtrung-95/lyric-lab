"use client";

import { VideoLessonLoader } from "./video-lesson-loader";
import { VideoWatchScreen } from "./video-watch-screen";

/** Trang xem video luyện nghe (bản chép, bấm từ để tra). */
export function VideoPage({ videoId, startAt }: { videoId: string; startAt?: number }) {
  return <VideoLessonLoader videoId={videoId}>{(lesson) => <VideoWatchScreen lesson={lesson} startAt={startAt} />}</VideoLessonLoader>;
}
