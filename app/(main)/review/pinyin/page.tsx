import type { Metadata } from "next";
import { PinyinPractice } from "@/components/practice/pinyin-practice";

export const metadata: Metadata = { title: "Gõ pinyin", robots: { index: false } };

export default function PinyinPage() {
  return <PinyinPractice />;
}
