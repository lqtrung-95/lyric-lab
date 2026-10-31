import type { Metadata } from "next";
import { SavedDrillsGame } from "@/components/practice/saved-drills-game";

export const metadata: Metadata = { title: "Luyện từ đã lưu", robots: { index: false } };

export default function SavedDrillsPage() {
  return <SavedDrillsGame />;
}
