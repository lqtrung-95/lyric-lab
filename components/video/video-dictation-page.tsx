"use client";

import { VideoDictationScreen } from "./video-dictation-screen";
import { VideoLessonLoader } from "./video-lesson-loader";

/** Trang chép chính tả của một video (tải video rồi dựng màn chép). */
export function VideoDictationPage({ videoId }: { videoId: string }) {
  return <VideoLessonLoader videoId={videoId}>{(lesson) => <VideoDictationScreen lesson={lesson} />}</VideoLessonLoader>;
}
