import { describe, expect, it } from "vitest";
import type { UnitProgress } from "./course-types";
import { UNIT_LEVELS, isLevelUnlocked, levelScores, passedLevels, nextLevel, starsOf, withLevelScore } from "./unit-levels";

const prog = (o: Partial<UnitProgress> = {}): UnitProgress => ({ unitId: "u", status: "completed", bestScore: 80, stepState: {}, completedAt: "x", ...o });

describe("nextLevel", () => {
  it("cấp đầu tiên chưa qua mà đã mở; null khi đủ 5 cấp", () => {
    expect(nextLevel(prog())?.id).toBe(2);
    expect(nextLevel(prog({ stepState: { levels: { "2": 90 } } }))?.id).toBe(3);
    expect(nextLevel(prog({ stepState: { levels: { "2": 90, "3": 90, "4": 60, "5": 90 } } }))).toBeNull();
    expect(nextLevel(prog({ status: "in_progress" }))?.id).toBe(1);
  });
});

describe("cấp của chặng", () => {
  it("năm cấp, id 1–5, cấp nói có bỏ qua được", () => {
    expect(UNIT_LEVELS.map((l) => l.id)).toEqual([1, 2, 3, 4, 5]);
    expect(UNIT_LEVELS.find((l) => l.speaking)?.id).toBe(4);
    for (const l of UNIT_LEVELS) { expect(l.pass).toBeGreaterThanOrEqual(60); expect(l.length).toBeGreaterThan(0); }
  });
  it("cấp 1 lấy từ điểm chặng khi đã hoàn thành; chưa hoàn thành thì không có", () => {
    expect(levelScores(prog())).toEqual({ 1: 80 });
    expect(levelScores(prog({ status: "in_progress" }))).toEqual({});
    expect(levelScores(undefined)).toEqual({});
  });
  it("điểm các cấp sau đọc từ stepState, bỏ rác", () => {
    const p = prog({ stepState: { levels: { "2": 75, "3": "x", "9": 50, "1": 99 } } });
    expect(levelScores(p)).toEqual({ 1: 80, 2: 75 });
  });
  it("qua cấp khi đủ ngưỡng của chính cấp đó (cấp 5 cần 85)", () => {
    expect(passedLevels(prog({ stepState: { levels: { "2": 70, "3": 69, "5": 84 } } }))).toEqual([1, 2]);
    expect(passedLevels(prog({ stepState: { levels: { "2": 70, "3": 70, "5": 85 } } }))).toEqual([1, 2, 3, 5]);
    expect(starsOf(prog({ stepState: { levels: { "2": 90, "3": 90, "4": 60, "5": 90 } } }))).toBe(5);
  });
  it("mở khóa theo chuỗi, cấp nói không chặn cấp huyền thoại", () => {
    expect(isLevelUnlocked(1, [])).toBe(true);
    expect(isLevelUnlocked(2, [])).toBe(false);
    expect(isLevelUnlocked(2, [1])).toBe(true);
    expect(isLevelUnlocked(4, [1, 2])).toBe(true);
    expect(isLevelUnlocked(5, [1, 2])).toBe(false);
    expect(isLevelUnlocked(5, [1, 2, 3])).toBe(true);
  });
  it("lưu điểm cấp giữ mức cao nhất và các trường khác", () => {
    const a = withLevelScore({ note: "x" }, 2, 60);
    expect(a).toEqual({ note: "x", levels: { "2": 60 } });
    expect(withLevelScore(a, 2, 40)).toEqual({ note: "x", levels: { "2": 60 } });
    expect(withLevelScore(a, 2, 90)).toEqual({ note: "x", levels: { "2": 90 } });
    expect(withLevelScore(undefined, 3, 70)).toEqual({ levels: { "3": 70 } });
  });
});
