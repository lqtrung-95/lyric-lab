"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { SCENES } from "@/lib/explore/scenes";
import { storyExits, storyRoute } from "@/lib/explore/story/story-route";
import type { SceneDetail } from "@/lib/explore/explore-types";
import type { StoryPayload } from "@/lib/explore/story/load-story";
import { ExploreScene } from "../explore-scene";
import { FireworksBurst } from "./fireworks-burst";
import { CoopBar } from "./coop-bar";
import { useStoryController, type CoopOptions } from "./use-story-controller";

/** Cảnh ở chế độ phá án: dựng bộ điều khiển cốt truyện rồi đưa vào màn khám phá. `basePath` là gốc đường dẫn các cảnh của vụ án này. */
export function StoryExploreScene({ scene, payload, basePath, coop }: { scene: SceneDetail; payload: StoryPayload; basePath: string; coop?: CoopOptions }) {
  const controller = useStoryController(payload, scene.npc.id, coop);
  // Trong vụ án, lối đi theo thứ tự điều tra của vụ (không theo đường nối chế độ tự do).
  // Và chỉ sang được cảnh đã mở; vào thẳng cảnh chưa mở bằng đường dẫn thì đưa về cảnh xuất phát.
  const router = useRouter();
  const { story } = payload;
  const open = controller.isSceneOpen;
  const route = storyRoute(story.objectives, story.startScene);
  const storyScene = { ...scene, exits: storyExits(route, scene.id, (id) => SCENES[id]?.title ?? id, open) };
  const locked = controller.ready && !open(scene.id);
  useEffect(() => { if (locked) router.replace(`${basePath}/${story.startScene}`); }, [locked, router, basePath, story.startScene]);
  // Buộc tội ở cảnh khác: sang cảnh kết thúc (kèm cờ) rồi nghe đoạn kết ở đó.
  useEffect(() => { if (controller.epilogueElsewhere) router.push(`${basePath}/${story.accuseScene}?epilogue=1`); }, [controller.epilogueElsewhere, router, basePath, story.accuseScene]);
  const { ready, solved, playEpilogue } = controller;
  useEffect(() => {
    if (!ready || !solved || scene.id !== story.accuseScene || !window.location.search.includes("epilogue=1")) return;
    window.history.replaceState(null, "", window.location.pathname);
    playEpilogue();
  }, [ready, solved, scene.id, story.accuseScene, playEpilogue]);
  if (locked) return null;
  return (
    <>
      {controller.coop && (
        <div className="mx-auto mb-space-md w-full max-w-3xl">
          <CoopBar coop={controller.coop} payload={payload} sceneId={scene.id} hasClue={(id) => controller.progress.clues.includes(id)} onOpenCase={() => controller.setView({ kind: "case" })} />
        </div>
      )}
      <ExploreScene scene={storyScene} story={{ payload, controller, basePath }} />
      {controller.celebrating && <FireworksBurst onDone={controller.endCelebration} />}
    </>
  );
}
