import type { Metadata } from "next";
import { ClozePractice } from "@/components/practice/cloze-practice";

export const metadata: Metadata = { title: "Điền lời", robots: { index: false } };

export default function ClozePage() {
  return <ClozePractice />;
}
