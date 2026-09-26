import type { Metadata } from "next";
import { ListenPractice } from "@/components/practice/listen-practice";

export const metadata: Metadata = { title: "Nghe và chọn", robots: { index: false } };

export default function ListenPage() {
  return <ListenPractice />;
}
