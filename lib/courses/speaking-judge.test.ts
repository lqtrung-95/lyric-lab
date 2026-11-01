import { describe, expect, it } from "vitest";
import { judgeRecall, speakingPercent } from "./speaking-judge";

describe("judgeRecall", () => {
  it("đúng khi có nguyên từ trong lời nhận diện", () => {
    expect(judgeRecall("我觉得煤气很贵", "煤气")).toBe(true);
    expect(judgeRecall("煤气。", "煤气")).toBe(true);
  });
  it("từ một hai chữ phải khớp nguyên vẹn", () => {
    expect(judgeRecall("煤", "煤气")).toBe(false);
    expect(judgeRecall("没气", "煤气")).toBe(false);
    expect(judgeRecall("", "猫")).toBe(false);
  });
  it("từ dài cho phép nhầm một chữ đồng âm (từ 80% số chữ)", () => {
    expect(judgeRecall("共同体息", "共同休息")).toBe(false);
    expect(judgeRecall("高跟鞋子", "高跟鞋")).toBe(true);
    expect(judgeRecall("共同休闲吧", "共同休息吧")).toBe(true);
  });
});

describe("speakingPercent", () => {
  it("không tính câu bỏ qua", () => {
    expect(speakingPercent(3, 5, 1, 2)).toEqual({ percent: 75, attempted: 4 });
  });
  it("nói ít hơn mức tối thiểu thì 0%", () => {
    expect(speakingPercent(1, 5, 4, 2)).toEqual({ percent: 0, attempted: 1 });
    expect(speakingPercent(0, 5, 5, 2)).toEqual({ percent: 0, attempted: 0 });
  });
});
