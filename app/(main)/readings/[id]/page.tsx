import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingPlayer } from "@/components/readings/reading-player";
import { loadReading } from "@/lib/readings/load-readings";

export const metadata: Metadata = { title: "Truyện ngắn", robots: { index: false } };

export default async function ReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const detail = /^[a-z0-9-]{1,60}$/.test(id) ? await loadReading(id) : null;
  if (!detail) notFound();
  return <ReadingPlayer key={detail.reading.id} reading={detail.reading} pinyin={detail.pinyin} level={detail.level} />;
}
