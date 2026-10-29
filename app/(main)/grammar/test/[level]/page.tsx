import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GrammarTest } from "@/components/grammar/grammar-test";
import { isGrammarLevel } from "@/lib/grammar/grammar-patterns";

export const metadata: Metadata = { title: "Thi ngữ pháp", robots: { index: false } };

export default async function GrammarTestPage({ params }: { params: Promise<{ level: string }> }) {
  const n = Number((await params).level);
  if (!isGrammarLevel(n)) notFound();
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-space-md">
      <Link href="/grammar" className="inline-flex min-h-11 w-fit items-center text-label-md font-bold underline">← Ngữ pháp</Link>
      <h1 className="text-headline-lg">Thi cuối cấp HSK {n}</h1>
      <GrammarTest level={n} title={`Kết quả HSK ${n}`} />
    </div>
  );
}
