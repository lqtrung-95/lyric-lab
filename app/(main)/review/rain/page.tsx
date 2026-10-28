import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Nhạc rơi", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Nhạc rơi" intro="Các hàng chữ Hán rơi như Piano Tiles: đọc pinyin, chạm đúng chữ trước khi hàng chạm đáy. Làm xong được tính điểm luyện tập (XP)." wide>
      <ArcadePlay kind="rain" bank={bank} />
    </ArcadeShell>
  );
}
