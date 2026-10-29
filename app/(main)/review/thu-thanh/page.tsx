import type { Metadata } from "next";
import { ArcadePlay } from "@/components/games/arcade-play";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Pet thủ thành", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function Page() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Pet thủ thành" intro="Quái mang chữ Hán đi về phía nhà, bạn nhỏ của bạn là tháp canh. Chọn đúng âm đọc (đúng thanh điệu) thì pet bắn hạ quái, chọn sai thì quái lọt qua. Chỉ để vui, không tính XP.">
      <ArcadePlay kind="tower" bank={bank} />
    </ArcadeShell>
  );
}
