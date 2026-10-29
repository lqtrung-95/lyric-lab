import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Đấu với pet", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Đấu với pet" intro="Năm câu, xem pinyin rồi bấm đúng chữ Hán trước bạn nhỏ của bạn. Mỗi loài có tính cách riêng, lớn hơn thì giỏi hơn. Chỉ để vui, không tính XP.">
      <ArcadePlay kind="petduel" bank={bank} />
    </ArcadeShell>
  );
}
