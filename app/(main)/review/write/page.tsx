import type { Metadata } from "next";
import { WritePractice } from "@/components/practice/write-practice";

export const metadata: Metadata = { title: "Viết chữ Hán", robots: { index: false } };

export default function WritePage() {
  return <WritePractice />;
}
