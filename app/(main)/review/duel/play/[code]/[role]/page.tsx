import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { DuelRoom } from "@/components/games/duel-room";
import { COOP_CODE } from "@/lib/explore/coop/coop-state";
import { DUEL_WORDS, duelWords } from "@/lib/games/duel";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Đấu 1–1", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Phòng Đấu 1–1: bộ từ suy ra từ mã phòng nên hai người nhận giống hệt nhau. */
export default async function DuelPlayPage({ params }: { params: Promise<{ code: string; role: string }> }) {
  const { code, role } = await params;
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room) || (role !== "a" && role !== "b")) notFound();
  const words = duelWords(await loadGameWords(), room, DUEL_WORDS);
  return (
    <ArcadeShell title="Đấu 1–1" intro="Cùng bộ từ, ai gõ đúng pinyin xong trước thì thắng. Gửi liên kết cho bạn rồi cả hai bấm sẵn sàng.">
      <DuelRoom key={`${room}/${role}`} code={room} role={role} words={words} />
    </ArcadeShell>
  );
}
