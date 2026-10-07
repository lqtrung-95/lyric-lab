import { describe, expect, it } from "vitest";
import { judgeAnswer, RESULT_PAUSE_MS } from "./judge-answer";

const base = { correctIndex: 2, clientElapsedMs: 2_000, serverGapMs: RESULT_PAUSE_MS + 2_000 };

describe("judgeAnswer", () => {
  it("đúng và nhanh được điểm cơ bản cộng thưởng tốc độ", () => {
    const r = judgeAnswer({ ...base, choice: 2 });
    expect(r.correct).toBe(true);
    expect(r.points).toBeGreaterThan(100);
    expect(r.points).toBeLessThanOrEqual(130);
  });
  it("sai thì 0 điểm", () => {
    expect(judgeAnswer({ ...base, choice: 1 })).toMatchObject({ correct: false, points: 0 });
  });
  it("hết giờ (choice -1) thì 0 điểm", () => {
    expect(judgeAnswer({ ...base, choice: -1 })).toMatchObject({ correct: false, points: 0, choice: -1 });
  });
  it("khai thời gian thấp hơn thực tế vẫn bị tính theo khoảng chờ ở server", () => {
    const honest = judgeAnswer({ ...base, choice: 2, clientElapsedMs: 10_000, serverGapMs: RESULT_PAUSE_MS + 10_000 });
    const liar = judgeAnswer({ ...base, choice: 2, clientElapsedMs: 100, serverGapMs: RESULT_PAUSE_MS + 10_000 });
    expect(liar.points).toBe(honest.points);
  });
  it("treo câu hỏi quá giờ rồi mới gửi thì không có điểm dù đúng", () => {
    expect(judgeAnswer({ ...base, choice: 2, clientElapsedMs: 500, serverGapMs: RESULT_PAUSE_MS + 40_000 })).toMatchObject({ correct: false, points: 0 });
  });
  it("còn trong dung sai thì vẫn tính", () => {
    expect(judgeAnswer({ ...base, choice: 2, clientElapsedMs: 15_000, serverGapMs: RESULT_PAUSE_MS + 17_000 }).correct).toBe(true);
  });
});
