import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RoomScreen } from "@/components/room/room-screen";
import { normalizeRoomCode } from "@/lib/rooms/room-code-format";

export const metadata: Metadata = { title: "Phòng thi đấu", robots: { index: false } };

export default async function RoomPage({ params }: { params: Promise<{ code: string }> }) {
  const code = normalizeRoomCode((await params).code);
  if (!code) notFound();
  return <RoomScreen code={code} />;
}
