import { describe, expect, it } from "vitest";
import { findCurrentLineIndex, shouldLoopBack } from "./find-current-line";

const lines = [0, 5, 10, 15].map((start) => ({ start, end: start + 4 })); // có khoảng lặng 1 giây giữa các câu

describe("findCurrentLineIndex", () => {
  it("trước câu đầu → -1", () => expect(findCurrentLineIndex(lines, -1)).toBe(-1));
  it("đúng biên bắt đầu và giữa câu", () => {
    expect(findCurrentLineIndex(lines, 0)).toBe(0);
    expect(findCurrentLineIndex(lines, 4.2)).toBe(0);
    expect(findCurrentLineIndex(lines, 5)).toBe(1);
    expect(findCurrentLineIndex(lines, 12)).toBe(2);
  });
  it("khoảng lặng giữa hai câu vẫn giữ câu trước", () => expect(findCurrentLineIndex(lines, 9.5)).toBe(1));
  it("câu cuối: giữ trong thời gian ân hạn rồi hết", () => {
    expect(findCurrentLineIndex(lines, 21)).toBe(3);
    expect(findCurrentLineIndex(lines, 23)).toBe(-1);
  });
  it("danh sách rỗng → -1", () => expect(findCurrentLineIndex([], 3)).toBe(-1));
  it("hàng nghìn câu vẫn đúng (nhị phân)", () => {
    const many = Array.from({ length: 5000 }, (_, i) => ({ start: i * 3, end: i * 3 + 2 }));
    expect(findCurrentLineIndex(many, 3 * 4321 + 1)).toBe(4321);
  });
});

describe("shouldLoopBack", () => {
  it("quay về khi sát hết câu", () => {
    expect(shouldLoopBack(3.5, { end: 4 })).toBe(false);
    expect(shouldLoopBack(3.96, { end: 4 })).toBe(true);
    expect(shouldLoopBack(6, { end: 4 })).toBe(true);
  });
});
