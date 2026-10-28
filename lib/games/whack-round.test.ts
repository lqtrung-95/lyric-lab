import { describe, expect, it } from "vitest";
import { HOLES, crowdFor, makeWhackRound, whackPoints, windowMs } from "./whack-round";

const pool = Array.from({ length: 12 }, (_, i) => ({ han: `字${i}`, pinyin: `a${i}` }));

describe("whack", () => {
  it("đáp án luôn có trên bàn, các chữ khác nhau, hố khác nhau", () => {
    const r = makeWhackRound(pool, 0, Math.random)!;
    const shown = r.cells.filter((c) => c !== null);
    expect(r.cells).toHaveLength(HOLES);
    expect(shown).toHaveLength(4);
    expect(shown.map((c) => c!.han)).toContain(r.answer.han);
    expect(new Set(shown.map((c) => c!.han)).size).toBe(4);
  });
  it("thiếu từ thì không tạo lượt", () => { expect(makeWhackRound([pool[0]], 0, Math.random)).toBeNull(); });
  it("độ khó tăng theo số lượt nhưng có trần", () => {
    expect(crowdFor(100)).toBe(6);
    expect(windowMs(100)).toBe(1200);
    expect(windowMs(5)).toBeLessThan(windowMs(0));
  });
  it("điểm có thưởng nhanh và combo", () => {
    expect(whackPoints(0, 0)).toBe(100);
    expect(whackPoints(1, 3)).toBe(180);
    expect(whackPoints(5, 99)).toBe(250);
  });
});
