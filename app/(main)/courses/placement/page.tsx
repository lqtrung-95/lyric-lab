import type { Metadata } from "next";
import { PlacementScreen } from "@/components/courses/placement-screen";

export const metadata: Metadata = { title: "Bài xếp lớp HSK", robots: { index: false } };

export default function PlacementPage() {
  return <PlacementScreen />;
}
