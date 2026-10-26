import type { SceneExit } from "../explore-types";
import type { Objective } from "./story-types";

/** Thứ tự các cảnh của một vụ án theo mục tiêu (mỗi cảnh một lần, theo lần xuất hiện đầu tiên). */
export function storyRoute(objectives: readonly Objective[], startScene: string): string[] {
  const out: string[] = [startScene];
  for (const o of objectives) if (o.sceneId && !out.includes(o.sceneId)) out.push(o.sceneId);
  return out;
}

/**
 * Lối đi trong một vụ án: sang cảnh kế tiếp và về cảnh liền trước theo thứ tự của vụ (không theo đường nối của chế độ tự do, vì thứ tự điều tra khác thứ tự địa lý).
 * `isOpen` quyết định cảnh nào đã mở; cảnh kế tiếp chưa mở vẫn có biển nhưng khóa (mờ, không đi qua được) để người chơi biết cần làm xong nhiệm vụ ở đây.
 */
export function storyExits(route: readonly string[], sceneId: string, titleOf: (id: string) => string, isOpen: (id: string) => boolean): SceneExit[] {
  const i = route.indexOf(sceneId);
  if (i < 0) return [];
  const exits: SceneExit[] = [];
  const prev = route[i - 1];
  const next = route[i + 1];
  if (prev && isOpen(prev)) exits.push({ sprite: "exitLeft", label: `Về ${titleOf(prev)}`, to: prev, x: 7, y: 58, w: 6 });
  if (next) exits.push({ sprite: "exit", label: isOpen(next) ? `Sang ${titleOf(next)}` : `${titleOf(next)} · xong nhiệm vụ để mở`, to: next, x: 92, y: 60, w: 6, ...(isOpen(next) ? {} : { locked: true }) });
  return exits;
}
