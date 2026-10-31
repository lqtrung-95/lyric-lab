import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RadicalDetail } from "@/components/radicals/radical-detail";
import { loadRadicalChars } from "@/lib/radicals/load-radical-chars";
import { entryByNum } from "@/lib/radicals/radicals";

type Params = Promise<{ num: string }>;
const parse = (s: string) => (/^\d{1,3}$/.test(s) ? entryByNum(Number(s)) : undefined);

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const e = parse((await params).num);
  return { title: e ? `Bộ ${e.name} ${e.char} · Bộ thủ` : "Bộ thủ", robots: { index: false } };
}

export default async function RadicalPage({ params }: { params: Params }) {
  const e = parse((await params).num);
  if (!e) notFound();
  const chars = await loadRadicalChars(e).catch(() => []);
  return <RadicalDetail entry={e} chars={chars} />;
}
