import type { Metadata } from "next";
import { RadicalsHub } from "@/components/radicals/radicals-hub";

export const metadata: Metadata = { title: "Bộ thủ chữ Hán", robots: { index: false } };

export default function RadicalsPage() {
  return <RadicalsHub />;
}
