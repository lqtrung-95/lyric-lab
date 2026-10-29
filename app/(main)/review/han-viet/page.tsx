import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { HanVietGame } from "@/components/games/han-viet-game";
import { parseChallenge } from "@/lib/challenge/challenge-link";
import { loadHanVietWords } from "@/lib/games/load-han-viet-words";

export const metadata: Metadata = { title: "Đoán chữ Hán từ Hán Việt", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const flat = new URLSearchParams(Object.entries(sp).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));
  const words = await loadHanVietWords();
  return (
    <ArcadeShell title="Đoán chữ Hán từ Hán Việt" intro="Biết Hán Việt là có lợi thế: xem âm Hán Việt như “đại học”, chọn đúng chữ Hán. Mười câu, thử xem bạn đoán đúng bao nhiêu rồi thách bạn bè.">
      <HanVietGame words={words} challenge={parseChallenge(flat)} />
    </ArcadeShell>
  );
}
