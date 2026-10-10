import { describe, expect, it } from "vitest";
import { DEFAULT_DAILY_GOAL, dailyGoalProgress, parseDailyGoal } from "./daily-goal";

describe("parseDailyGoal", () => {
  it("nhận các mức cho phép, kể cả 0 (tắt)", () => {
    for (const v of [0, 5, 10, 20, 30]) expect(parseDailyGoal(v)).toBe(v);
  });
  it("giá trị lạ hoặc thiếu thì về mặc định", () => {
    for (const v of [7, -5, "10", null, undefined, 99]) expect(parseDailyGoal(v)).toBe(DEFAULT_DAILY_GOAL);
  });
});

describe("dailyGoalProgress", () => {
  it("tính tỉ lệ, đạt khi đủ hoặc vượt, giới hạn 1", () => {
    expect(dailyGoalProgress(4, 10)).toMatchObject({ fraction: 0.4, done: false, enabled: true });
    expect(dailyGoalProgress(10, 10)).toMatchObject({ fraction: 1, done: true });
    expect(dailyGoalProgress(25, 10)).toMatchObject({ fraction: 1, done: true });
  });
  it("tắt mục tiêu thì không bao giờ 'đạt'", () => expect(dailyGoalProgress(50, 0)).toMatchObject({ enabled: false, done: false, fraction: 0 }));
});
