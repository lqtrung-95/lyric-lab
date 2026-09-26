import type { Metadata } from "next";
import { KaraokePractice } from "@/components/practice/karaoke-practice";

export const metadata: Metadata = { title: "Karaoke điền lời", robots: { index: false } };

export default function KaraokePage() {
  return <KaraokePractice />;
}
