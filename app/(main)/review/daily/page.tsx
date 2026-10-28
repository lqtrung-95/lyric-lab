import type { Metadata } from "next";
import { ArcadeShell } from "@/components/games/arcade-shell";
import { DailyGame } from "@/components/games/daily-game";
import { dayKey } from "@/lib/games/daily-word";
import { loadGameWords } from "@/lib/games/load-game-words";

export const metadata: Metadata = { title: "Hán tự mỗi ngày", robots: { index: false } };
export const dynamic = "force-dynamic";

/** Hán tự mỗi ngày: một từ hai chữ chung cho mọi người, đoán trong 6 lượt bằng pinyin có số thanh. */
export default async function DailyPage() {
  const bank = await loadGameWords();
  return (
    <ArcadeShell title="Hán tự mỗi ngày" intro="Mỗi ngày một từ hai chữ, cả nước cùng đoán. Gõ pinyin (thanh gõ hay không đều được, nhưng muốn thắng phải đủ thanh); mỗi âm tiết được chấm phụ âm đầu, vần và thanh. Thắng thì chia sẻ kết quả cho bạn bè.">
      <DailyGame bank={bank} todayKey={dayKey(new Date())} />
    </ArcadeShell>
  );
}
