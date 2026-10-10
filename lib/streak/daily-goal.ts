/**
 * Mục tiêu học mỗi ngày, tính bằng số "mục": một lần chấm thẻ ôn, một câu chép chính tả hoặc luyện nói theo video, hoặc một câu hỏi trong lượt luyện tập.
 * 0 = tắt mục tiêu.
 */
export const DAILY_GOAL_OPTIONS = [0, 5, 10, 20, 30] as const;
export const DEFAULT_DAILY_GOAL = 10;

/** Giá trị mục tiêu hợp lệ (một trong các mức cho phép); sai hoặc thiếu thì dùng mặc định. */
export function parseDailyGoal(value: unknown): number {
  return typeof value === "number" && (DAILY_GOAL_OPTIONS as readonly number[]).includes(value) ? value : DEFAULT_DAILY_GOAL;
}

export interface DailyGoalProgress {
  goal: number;
  items: number;
  /** 0..1, giới hạn ở 1 khi vượt mục tiêu. */
  fraction: number;
  enabled: boolean;
  done: boolean;
}

export function dailyGoalProgress(items: number, goal: number): DailyGoalProgress {
  const enabled = goal > 0;
  return { goal, items, enabled, fraction: enabled ? Math.min(1, items / goal) : 0, done: enabled && items >= goal };
}
