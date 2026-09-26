import type { Metadata } from "next";
import { MatchPractice } from "@/components/practice/match-practice";

export const metadata: Metadata = { title: "Ghép cặp", robots: { index: false } };

export default function MatchPage() {
  return <MatchPractice />;
}
