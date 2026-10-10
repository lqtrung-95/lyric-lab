import { describe, expect, it } from "vitest";
import { CLIP_ADJUST_LIMIT, NO_ADJUST, clipRange, isAdjusted, nudgeAdjust } from "./clip-range";

describe("clipRange", () => {
  it("đệm đầu 0,3 giây và đuôi 0,7 giây khi chưa chỉnh", () => {
    const r = clipRange({ start: 13, end: 16 });
    expect(r.start).toBeCloseTo(12.7);
    expect(r.end).toBeCloseTo(16.7);
  });
  it("không bắt đầu trước giây 0", () => expect(clipRange({ start: 0, end: 2 }).start).toBe(0));
  it("cộng phần người học chỉnh", () => {
    const r = clipRange({ start: 10, end: 12 }, { start: -0.5, end: 1 });
    expect(r.start).toBeCloseTo(9.2);
    expect(r.end).toBeCloseTo(13.7);
  });
  it("luôn dài ít nhất 0,6 giây dù bị chỉnh quá tay", () => {
    const r = clipRange({ start: 10, end: 10.2 }, { start: 3, end: -3 });
    expect(r.end - r.start).toBeCloseTo(0.6);
  });
});

describe("nudgeAdjust", () => {
  it("cộng dồn từng nấc và chặn ở ±3 giây", () => {
    let a = NO_ADJUST;
    for (let i = 0; i < 20; i++) a = nudgeAdjust(a, "end", 0.5);
    expect(a).toEqual({ start: 0, end: CLIP_ADJUST_LIMIT });
    expect(nudgeAdjust(NO_ADJUST, "start", -0.5)).toEqual({ start: -0.5, end: 0 });
  });
  it("isAdjusted nhận ra khi đã chỉnh và khi về 0", () => {
    expect(isAdjusted(NO_ADJUST)).toBe(false);
    expect(isAdjusted(nudgeAdjust(nudgeAdjust(NO_ADJUST, "start", 0.5), "start", -0.5))).toBe(false);
    expect(isAdjusted({ start: 0, end: 0.5 })).toBe(true);
  });
});
