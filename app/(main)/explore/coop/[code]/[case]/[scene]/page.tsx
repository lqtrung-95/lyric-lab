import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryExploreScene } from "@/components/explore/story/story-explore-scene";
import { COOP_CODE, parseRole } from "@/lib/explore/coop/coop-state";
import { loadScene } from "@/lib/explore/load-scene";
import { loadStoryPayload } from "@/lib/explore/story/load-story";

export const metadata: Metadata = { title: "Phá án cùng bạn", robots: { index: false } };

const ID = /^[a-z0-9-]{1,40}$/;

/** Một cảnh của vụ án chơi chung. Người tạo phòng vào bằng `?r=a`; liên kết mời không có `r` nên người nhận là vai B. */
export default async function CoopSceneRoute({ params, searchParams }: { params: Promise<{ code: string; case: string; scene: string }>; searchParams: Promise<{ r?: string }> }) {
  const [{ code, case: caseId, scene: sceneId }, { r }] = await Promise.all([params, searchParams]);
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room) || !ID.test(caseId) || !ID.test(sceneId)) notFound();
  const [scene, payload] = await Promise.all([loadScene(sceneId), loadStoryPayload(caseId, sceneId)]);
  if (!scene || !payload) notFound();
  return <StoryExploreScene key={`${room}/${caseId}/${sceneId}`} scene={scene} payload={payload} basePath={`/explore/coop/${room}/${caseId}`} coop={{ code: room, role: parseRole(r) }} />;
}
