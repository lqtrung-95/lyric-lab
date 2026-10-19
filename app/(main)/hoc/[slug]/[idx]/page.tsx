import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnitScreen } from "@/components/courses/unit-screen";

export const metadata: Metadata = { title: "Học theo lộ trình", robots: { index: false } };

export default async function UnitPage({ params }: { params: Promise<{ slug: string; idx: string }> }) {
  const { slug, idx } = await params;
  const n = Number(idx);
  if (!/^[a-z0-9-]{1,40}$/.test(slug) || !Number.isInteger(n) || n < 1) notFound();
  return <UnitScreen slug={slug} idx={n} />;
}
