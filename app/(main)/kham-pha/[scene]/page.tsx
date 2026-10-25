import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExploreScene } from "@/components/explore/explore-scene";
import { loadScene } from "@/lib/explore/load-scene";

export const metadata: Metadata = { title: "Khám phá", robots: { index: false } };

export default async function ExploreScenePage({ params }: { params: Promise<{ scene: string }> }) {
  const { scene: id } = await params;
  const scene = /^[a-z0-9-]{1,40}$/.test(id) ? await loadScene(id) : null;
  if (!scene) notFound();
  return <ExploreScene scene={scene} />;
}
