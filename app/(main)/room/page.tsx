import type { Metadata } from "next";
import { RoomHub } from "@/components/room/room-hub";

export const metadata: Metadata = { title: "Thi đấu 1v1", robots: { index: false } };

export default function RoomHubPage() {
  return <RoomHub />;
}
