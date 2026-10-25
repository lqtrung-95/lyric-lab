"use client";

import type { SceneDetail } from "@/lib/explore/explore-types";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { ExploreScene } from "../explore-scene";
import { payloadScenes } from "./story-panels";
import { useStoryController } from "./use-story-controller";

/** Cảnh ở chế độ phá án: dựng bộ điều khiển cốt truyện rồi đưa vào màn khám phá. `basePath` là gốc đường dẫn các cảnh của vụ án này. */
export function StoryExploreScene({ scene, payload, basePath }: { scene: SceneDetail; payload: StoryPayload; basePath: string }) {
  const controller = useStoryController(payload, scene.npc.id);
  // Trong vụ án chỉ đi được sang các cảnh có tham gia cốt truyện (các cảnh khác chỉ có ở chế độ tự do).
  const inCase = payloadScenes(payload.story);
  const storyScene = { ...scene, exits: scene.exits.filter((e) => e.to in inCase) };
  return <ExploreScene scene={storyScene} story={{ payload, controller, basePath }} />;
}
