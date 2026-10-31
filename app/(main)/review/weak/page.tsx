import type { Metadata } from "next";
import { WeakMap } from "@/components/review/weak-map";

export const metadata: Metadata = { title: "Điểm yếu của bạn", robots: { index: false } };

export default function WeakPage() {
  return <WeakMap />;
}
