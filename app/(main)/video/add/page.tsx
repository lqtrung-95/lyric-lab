import type { Metadata } from "next";
import { AddVideoScreen } from "@/components/video/add-video-screen";

export const metadata: Metadata = { title: "Thêm video", robots: { index: false } };

export default function AddVideoPage() {
  return <AddVideoScreen />;
}
