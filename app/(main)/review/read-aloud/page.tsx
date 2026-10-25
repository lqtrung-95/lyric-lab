import type { Metadata } from "next";
import { SavedCardsReadAloud } from "@/components/pronunciation/saved-cards-read-aloud";

export const metadata: Metadata = { title: "Đọc to từ đã lưu", robots: { index: false } };

export default function SavedCardsReadAloudPage() {
  return <SavedCardsReadAloud />;
}
