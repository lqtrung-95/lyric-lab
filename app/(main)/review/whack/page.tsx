import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Đập chữ", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Đập chữ" intro="30 giây đập đúng chữ Hán theo pinyin trong chín hố trước khi chúng biến mất. Làm xong được tính điểm luyện tập (XP)." wide>
      <ArcadePlay kind="whack" bank={bank} />
    </ArcadeShell>
  );
}
