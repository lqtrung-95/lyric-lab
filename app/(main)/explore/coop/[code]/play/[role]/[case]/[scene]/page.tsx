import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryExploreScene } from "@/components/explore/story/story-explore-scene";
import { COOP_CODE } from "@/lib/explore/coop/coop-state";
import { loadScene } from "@/lib/explore/load-scene";
import { loadStoryPayload } from "@/lib/explore/story/load-story";

export const metadata: Metadata = { title: "Phá án cùng bạn", robots: { index: false } };

const ID = /^[a-z0-9-]{1,40}$/;

/**
 * Một cảnh của vụ án chơi chung. Vai (a hoặc b) nằm TRONG đường dẫn (`/explore/coop/<mã>/play/<vai>/<vụ án>/<cảnh>`) nên mọi liên kết đổi cảnh (bản đồ, lối ra) đều giữ đúng vai;
 * trước đây vai chỉ nằm ở `?r=a` của lần vào đầu tiên và bị mất khi sang cảnh khác (người tạo phòng bị đổi thành thám tử B).
 */
export default async function CoopSceneRoute({ params }: { params: Promise<{ code: string; role: string; case: string; scene: string }> }) {
  const { code, role, case: caseId, scene: sceneId } = await params;
  const room = code.toUpperCase();
  if (!COOP_CODE.test(room) || (role !== "a" && role !== "b") || !ID.test(caseId) || !ID.test(sceneId)) notFound();
  const [scene, payload] = await Promise.all([loadScene(sceneId), loadStoryPayload(caseId, sceneId)]);
  if (!scene || !payload) notFound();
  return <StoryExploreScene key={`${room}/${role}/${caseId}/${sceneId}`} scene={scene} payload={payload} basePath={`/explore/coop/${room}/play/${role}/${caseId}`} coop={{ code: room, role }} />;
}
