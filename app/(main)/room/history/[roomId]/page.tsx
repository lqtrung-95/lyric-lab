import type { Metadata } from "next";
import { RoomHistoryDetail } from "@/components/room/room-history-detail";

export const metadata: Metadata = { title: "Xem lại ván thi đấu", robots: { index: false } };

export default async function RoomHistoryDetailPage({ params }: { params: Promise<{ roomId: string }> }) {
  return <RoomHistoryDetail roomId={(await params).roomId} />;
}
