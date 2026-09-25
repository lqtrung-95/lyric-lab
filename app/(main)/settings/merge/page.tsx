import type { Metadata } from "next";
import { MergeConfirm } from "@/components/settings/merge-confirm";

export const metadata: Metadata = { title: "Gộp dữ liệu", robots: { index: false } };

export default function MergePage() {
  return <MergeConfirm />;
}
