import { progressKey, type ExploreProgress } from "./explore-progress";
import type { SceneDef } from "./explore-types";

/** Các từ (chữ Hán) người chơi đã học ở cảnh Khám phá: dùng để đánh dấu chúng trong lời bài hát/video. */
export function learnedTerms(progress: ExploreProgress, scenes: readonly SceneDef[]): Set<string> {
  const out = new Set<string>();
  for (const scene of scenes) for (const o of scene.objects) if (progressKey(scene.id, o.id) in progress.terms) out.add(o.term);
  return out;
}
