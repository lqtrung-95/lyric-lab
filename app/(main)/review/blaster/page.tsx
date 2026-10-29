import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Bắn chữ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Bắn chữ" intro="Hai chế độ: Phi đội (lái tàu, bắn đúng máy bay mang chữ theo nghĩa hoặc pinyin, có vật phẩm và trùm) và Gõ pinyin (chữ rơi từ trên xuống, gõ pinyin để bắn nổ). Làm xong được tính điểm luyện tập (XP)." wide>
      <ArcadePlay kind="blaster" bank={bank} />
    </ArcadeShell>
  );
}
