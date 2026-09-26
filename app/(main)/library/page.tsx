import type { Metadata } from "next";
import { LibraryScreen, type LibraryTab } from "@/components/library/library-screen";

export const metadata: Metadata = { title: "Thư viện", robots: { index: false } };

const TABS: LibraryTab[] = ["songs", "discover", "words"];

export default async function LibraryPage({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const { tab } = await searchParams;
  return <LibraryScreen initialTab={TABS.find((t) => t === tab) ?? "songs"} />;
}
