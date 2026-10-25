import { holds } from "./story-state";
import type { Objective } from "./story-types";

/** Mục tiêu hiện tại: mục đầu tiên đang hiện (điều kiện `when` đúng) mà chưa xong. Null khi hết mục tiêu. */
export function currentObjective(objectives: readonly Objective[], flags: readonly string[]): Objective | null {
  return objectives.find((o) => holds(o.when, flags) && !holds(o.done, flags)) ?? null;
}

/** Tiến độ: số mục tiêu đã xong / tổng. */
export function objectiveProgress(objectives: readonly Objective[], flags: readonly string[]): { done: number; total: number } {
  return { done: objectives.filter((o) => holds(o.done, flags)).length, total: objectives.length };
}

/** Cảnh đã mở chưa: cảnh xuất phát luôn mở; cảnh khác mở khi mục tiêu đầu tiên ở đó đã hiện ra (nghĩa là đã làm xong các việc trước nó). Cảnh không có mục tiêu nào thì không mở. */
export function sceneUnlocked(objectives: readonly Objective[], startScene: string, flags: readonly string[], sceneId: string): boolean {
  if (sceneId === startScene) return true;
  const first = objectives.find((o) => o.sceneId === sceneId);
  return !!first && holds(first.when, flags);
}
