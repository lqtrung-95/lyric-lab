"use client";

import { VideoLessonLoader } from "./video-lesson-loader";
import { VideoShadowingScreen } from "./video-shadowing-screen";

/** Trang luyện nói theo (shadowing) của một video (tải video rồi dựng màn luyện). */
export function VideoShadowingPage({ videoId }: { videoId: string }) {
  return <VideoLessonLoader videoId={videoId}>{(lesson) => <VideoShadowingScreen lesson={lesson} />}</VideoLessonLoader>;
}
