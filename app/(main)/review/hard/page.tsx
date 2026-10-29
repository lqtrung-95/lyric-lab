import type { Metadata } from "next";
import { HardWordsPractice } from "@/components/practice/hard-words-practice";

export const metadata: Metadata = { title: "Từ khó", robots: { index: false } };

export default function HardPage() {
  return <HardWordsPractice />;
}
