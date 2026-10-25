"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { sceneUnlocked } from "@/lib/explore/story/objectives";
import type { SceneDetail } from "@/lib/explore/explore-types";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { ExploreScene } from "../explore-scene";
import { payloadScenes } from "./story-panels";
import { useStoryController } from "./use-story-controller";

/** Cảnh ở chế độ phá án: dựng bộ điều khiển cốt truyện rồi đưa vào màn khám phá. `basePath` là gốc đường dẫn các cảnh của vụ án này. */
export function StoryExploreScene({ scene, payload, basePath }: { scene: SceneDetail; payload: StoryPayload; basePath: string }) {
  const controller = useStoryController(payload, scene.npc.id);
  // Trong vụ án chỉ đi được sang các cảnh có tham gia cốt truyện (các cảnh khác chỉ có ở chế độ tự do).
  // Và chỉ sang được cảnh đã mở; vào thẳng cảnh chưa mở bằng đường dẫn thì đưa về cảnh xuất phát.
  const router = useRouter();
  const inCase = payloadScenes(payload.story);
  const { story } = payload;
  const flags = controller.progress.flags;
  const open = (id: string) => sceneUnlocked(story.objectives, story.startScene, flags, id);
  const storyScene = { ...scene, exits: scene.exits.filter((e) => e.to in inCase && open(e.to)) };
  const locked = controller.ready && !open(scene.id);
  useEffect(() => { if (locked) router.replace(`${basePath}/${story.startScene}`); }, [locked, router, basePath, story.startScene]);
  if (locked) return null;
  return <ExploreScene scene={storyScene} story={{ payload, controller, basePath }} />;
}
