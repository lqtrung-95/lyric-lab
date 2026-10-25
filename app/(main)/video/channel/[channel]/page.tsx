import type { Metadata } from "next";
import { ChannelVideosScreen } from "@/components/video/channel-videos-screen";
import { channelFromSlug } from "@/lib/video/group-by-channel";

export const metadata: Metadata = { title: "Video của kênh", robots: { index: false } };

export default async function ChannelVideosPage({ params }: { params: Promise<{ channel: string }> }) {
  const { channel } = await params;
  return <ChannelVideosScreen channelTitle={channelFromSlug(channel)} />;
}
