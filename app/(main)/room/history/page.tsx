import type { Metadata } from "next";
import { RoomHistoryScreen } from "@/components/room/room-history-screen";

export const metadata: Metadata = { title: "Lịch sử thi đấu", robots: { index: false } };

export default function RoomHistoryPage() {
  return <RoomHistoryScreen />;
}
