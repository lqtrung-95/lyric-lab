import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AdminGate } from "@/components/admin/admin-gate";
import { VideoAdminDetailScreen } from "@/components/admin/video-admin-detail-screen";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const metadata: Metadata = { title: "Rà soát video", robots: { index: false } };

export default async function AdminVideoDetailPage({ params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) notFound();
  return (
    <AdminGate>
      <VideoAdminDetailScreen videoId={videoId} />
    </AdminGate>
  );
}
