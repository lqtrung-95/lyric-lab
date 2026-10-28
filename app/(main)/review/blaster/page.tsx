import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Bắn chữ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Bắn chữ" intro="Từ Hán rơi từ trên xuống: nhìn chữ, gõ pinyin để bắn nổ trước khi chạm đáy. Càng bắn nhiều, từ rơi càng nhanh. Làm xong được tính điểm luyện tập (XP)." wide>
      <ArcadePlay kind="blaster" bank={bank} />
    </ArcadeShell>
  );
}
