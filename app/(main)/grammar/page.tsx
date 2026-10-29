import type { Metadata } from "next";
import { GrammarHub } from "@/components/grammar/grammar-hub";

export const metadata: Metadata = { title: "Ngữ pháp thông dụng", robots: { index: false } };

export default function GrammarPage() {
  return <GrammarHub />;
}
