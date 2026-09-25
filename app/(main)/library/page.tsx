import type { Metadata } from "next";
import { LibraryScreen } from "@/components/library/library-screen";

export const metadata: Metadata = { title: "Thư viện", robots: { index: false } };

export default function LibraryPage() {
  return <LibraryScreen />;
}
