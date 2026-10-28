import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { DuelLobby } from "@/components/games/duel-lobby";

export const metadata: Metadata = { title: "Đấu 1–1", robots: { index: false } };

/** Đấu 1–1: thách một người bạn gõ pinyin 10 từ, ai về đích nhanh hơn thắng. */
export default function DuelPage() {
  return (
    <ArcadeShell title="Đấu 1–1" intro="Thách một người bạn: cùng 10 từ Hán, ai gõ đúng pinyin xong trước thì thắng. Tạo phòng, gửi liên kết, rồi cả hai bấm sẵn sàng.">
      <DuelLobby />
    </ArcadeShell>
  );
}
