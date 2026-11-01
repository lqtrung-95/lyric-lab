import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnitScreen } from "@/components/courses/unit-screen";

export const metadata: Metadata = { title: "Học theo lộ trình", robots: { index: false } };

export default async function UnitPage({ params, searchParams }: { params: Promise<{ slug: string; idx: string }>; searchParams: Promise<{ mode?: string | string[]; level?: string | string[] }> }) {
  const { slug, idx } = await params;
  const { mode, level } = await searchParams;
  const lvl = typeof level === "string" && /^[1-5]$/.test(level) ? Number(level) : 1;
  const n = Number(idx);
  if (!/^[a-z0-9-]{1,40}$/.test(slug) || !Number.isInteger(n) || n < 1) notFound();
  return <UnitScreen key={`${n}-${lvl}-${mode ?? ""}`} slug={slug} idx={n} mode={mode === "review" ? "review" : undefined} level={lvl} />;
}
