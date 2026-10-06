import { describe, expect, it } from "vitest";
import { emptyDictationProgress, firstUndone, parseDictationProgress, summarizeProgress, withScore } from "./dictation-progress";

describe("parseDictationProgress", () => {
  it("rỗng hoặc hỏng thì dùng mặc định", () => {
    expect(parseDictationProgress(null)).toEqual(emptyDictationProgress);
    expect(parseDictationProgress("{hỏng")).toEqual(emptyDictationProgress);
  });
  it("đọc chế độ và điểm hợp lệ, bỏ giá trị lạ", () => {
    expect(parseDictationProgress('{"mode":"hanzi","scores":{"0":1,"2":0.5,"x":1,"3":2,"4":"a"}}')).toEqual({ mode: "hanzi", scores: { 0: 1, 2: 0.5 } });
    expect(parseDictationProgress('{"mode":"lạ"}').mode).toBe("pinyin");
  });
});

describe("tiến độ", () => {
  it("withScore ghi đè điểm của dòng, firstUndone tìm dòng chưa làm, summarize tính trung bình", () => {
    let p = withScore(emptyDictationProgress, 5, 1);
    p = withScore(p, 7, 0.5);
    p = withScore(p, 5, 0.75);
    const idxs = [5, 7, 9];
    expect(firstUndone(idxs, p)).toBe(2);
    expect(summarizeProgress(idxs, p)).toEqual({ done: 2, total: 3, average: 0.625 });
    expect(firstUndone([5, 7], p)).toBe(-1);
    expect(summarizeProgress([], emptyDictationProgress)).toEqual({ done: 0, total: 0, average: 0 });
  });
});
