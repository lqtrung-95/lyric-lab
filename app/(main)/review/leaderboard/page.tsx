import type { Metadata } from "next";
import { LeaderboardScreen } from "@/components/leaderboard/leaderboard-screen";

export const metadata: Metadata = { title: "Bảng xếp hạng", robots: { index: false } };

export default function LeaderboardPage() {
  return <LeaderboardScreen />;
}
