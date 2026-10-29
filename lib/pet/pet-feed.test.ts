import { describe, expect, it } from "vitest";
import { feedDone, feedLimit } from "./pet-feed";

describe("feedLimit", () => {
  it("tối đa 3, ít hơn khi hàng đợi ngắn", () => {
    expect(feedLimit(50)).toBe(3);
    expect(feedLimit(2)).toBe(2);
    expect(feedLimit(0)).toBe(0);
  });
  it("số lạ thành 0", () => {
    expect(feedLimit(Number.NaN)).toBe(0);
    expect(feedLimit(-4)).toBe(0);
  });
});

describe("feedDone", () => {
  it("đủ khi chấm đủ số thẻ; không có thẻ thì không đủ", () => {
    expect(feedDone(2, 3)).toBe(false);
    expect(feedDone(3, 3)).toBe(true);
    expect(feedDone(0, 0)).toBe(false);
  });
});
