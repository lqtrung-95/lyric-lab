import type { Metadata } from "next";
import Link from "next/link";
import { RadicalPractice } from "@/components/radicals/radical-practice";
import { isTopicId } from "@/lib/radicals/radicals";

export const metadata: Metadata = { title: "Luyện bộ thủ", robots: { index: false } };

export default async function RadicalPracticePage({ searchParams }: { searchParams: Promise<{ topic?: string | string[]; source?: string | string[] }> }) {
  const { topic, source } = await searchParams;
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <Link href="/radicals" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Bộ thủ</Link>
      <h1 className="text-headline-lg">Luyện bộ thủ</h1>
      <RadicalPractice initialTopic={typeof topic === "string" && isTopicId(topic) ? topic : null} initialSource={source === "weak" || source === "unknown" ? source : null} />
    </div>
  );
}
