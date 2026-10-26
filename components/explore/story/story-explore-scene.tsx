"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENES } from "@/lib/explore/scenes";
import { sceneUnlocked } from "@/lib/explore/story/objectives";
import { storyExits, storyRoute } from "@/lib/explore/story/story-route";
import type { SceneDetail } from "@/lib/explore/explore-types";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { ExploreScene } from "../explore-scene";
import { FireworksBurst } from "./fireworks-burst";
import { useStoryController } from "./use-story-controller";

/** Cảnh ở chế độ phá án: dựng bộ điều khiển cốt truyện rồi đưa vào màn khám phá. `basePath` là gốc đường dẫn các cảnh của vụ án này. */
export function StoryExploreScene({ scene, payload, basePath }: { scene: SceneDetail; payload: StoryPayload; basePath: string }) {
  const controller = useStoryController(payload, scene.npc.id);
  // Trong vụ án, lối đi theo thứ tự điều tra của vụ (không theo đường nối chế độ tự do).
  // Và chỉ sang được cảnh đã mở; vào thẳng cảnh chưa mở bằng đường dẫn thì đưa về cảnh xuất phát.
  const router = useRouter();
  const { story } = payload;
  const flags = controller.progress.flags;
  const open = (id: string) => sceneUnlocked(story.objectives, story.startScene, flags, id);
  const route = storyRoute(story.objectives, story.startScene);
  const storyScene = { ...scene, exits: storyExits(route, scene.id, (id) => SCENES[id]?.title ?? id, open) };
  const locked = controller.ready && !open(scene.id);
  useEffect(() => { if (locked) router.replace(`${basePath}/${story.startScene}`); }, [locked, router, basePath, story.startScene]);
  if (locked) return null;
  return (
    <>
      <ExploreScene scene={storyScene} story={{ payload, controller, basePath }} />
      {controller.celebrating && <FireworksBurst onDone={controller.endCelebration} />}
    </>
  );
}
