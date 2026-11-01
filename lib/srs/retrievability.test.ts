import { describe, expect, it } from "vitest";
import { cardRetrievability, retrievability } from "./retrievability";

describe("retrievability", () => {
  it("bằng 90% khi t = S (chuẩn FSRS: độ bền là số ngày để rơi từ 100% xuống 90%)", () => {
    expect(retrievability(10, 10)).toBeCloseTo(0.9, 2);
  });
  it("giảm dần theo thời gian, chậm hơn khi độ bền lớn", () => {
    expect(retrievability(5, 1)).toBeGreaterThan(retrievability(5, 10));
    expect(retrievability(30, 10)).toBeGreaterThan(retrievability(5, 10));
  });
  it("vừa ôn hoặc dữ liệu lạ thì coi như còn nhớ hết", () => {
    expect(retrievability(5, 0)).toBe(1);
    expect(retrievability(0, 5)).toBe(1);
  });
  it("thẻ chưa từng ôn thì không có số", () => {
    const now = new Date("2026-11-01T00:00:00Z");
    expect(cardRetrievability({ reps: 0, stability: 0, last_review: null, due: now.toISOString() }, now)).toBeNull();
    expect(cardRetrievability({ reps: 3, stability: 10, last_review: "2026-10-22T00:00:00Z", due: now.toISOString() }, now)).toBeCloseTo(0.9, 2);
  });
});
