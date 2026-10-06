import type { Metadata } from "next";
import { VideoListScreen } from "@/components/video/video-list-screen";

export const metadata: Metadata = { title: "Video luyện nghe", robots: { index: false } };

export default function VideoListPage() {
  return <VideoListScreen />;
}
