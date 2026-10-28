import type { Metadata } from "next";
import { FiveWordPractice } from "@/components/speaking/five-word-practice";

export const metadata: Metadata = { title: "Dùng 5 từ", robots: { index: false } };

export default function SpeakFiveWordsPage() {
  return <FiveWordPractice />;
}
