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
