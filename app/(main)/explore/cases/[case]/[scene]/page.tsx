import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryExploreScene } from "@/components/explore/story/story-explore-scene";
import { loadScene } from "@/lib/explore/load-scene";
import { loadStoryPayload } from "@/lib/explore/story/load-story";

export const metadata: Metadata = { title: "Phá án", robots: { index: false } };

const ID = /^[a-z0-9-]{1,40}$/;

export default async function StorySceneRoute({ params }: { params: Promise<{ case: string; scene: string }> }) {
  const { case: caseId, scene: sceneId } = await params;
  if (!ID.test(caseId) || !ID.test(sceneId)) notFound();
  const [scene, payload] = await Promise.all([loadScene(sceneId), loadStoryPayload(caseId, sceneId)]);
  if (!scene || !payload) notFound();
  return <StoryExploreScene key={`${caseId}/${sceneId}`} scene={scene} payload={payload} basePath={`/explore/cases/${caseId}`} />;
}
