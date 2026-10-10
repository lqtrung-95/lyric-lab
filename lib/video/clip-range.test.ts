import { describe, expect, it } from "vitest";
import { CLIP_ADJUST_LIMIT, CLIP_ADJUST_STEP, NO_ADJUST, clipRange, isAdjusted, nudgeAdjust } from "./clip-range";

describe("clipRange", () => {
  it("giữ đúng mốc của câu khi chưa chỉnh", () => expect(clipRange({ start: 13, end: 16 })).toEqual({ start: 13, end: 16 }));
  it("không bắt đầu trước giây 0", () => expect(clipRange({ start: 0, end: 2 }).start).toBe(0));
  it("cộng phần người học chỉnh", () => {
    const r = clipRange({ start: 10, end: 12 }, { start: -0.5, end: 1 });
    expect(r.start).toBeCloseTo(9.5);
    expect(r.end).toBeCloseTo(13);
  });
  it("luôn dài ít nhất 0,6 giây dù bị chỉnh quá tay", () => {
    const r = clipRange({ start: 10, end: 10.2 }, { start: 3, end: -3 });
    expect(r.end - r.start).toBeCloseTo(0.6);
  });
});

describe("nudgeAdjust", () => {
  it("cộng dồn từng nấc và chặn ở ±3 giây", () => {
    let a = NO_ADJUST;
    for (let i = 0; i < 50; i++) a = nudgeAdjust(a, "end", CLIP_ADJUST_STEP);
    expect(a).toEqual({ start: 0, end: CLIP_ADJUST_LIMIT });
    expect(nudgeAdjust(NO_ADJUST, "start", -CLIP_ADJUST_STEP)).toEqual({ start: -0.1, end: 0 });
    expect(nudgeAdjust(nudgeAdjust(NO_ADJUST, "end", 0.1), "end", 0.1)).toEqual({ start: 0, end: 0.2 }); // không dính sai số số thực
  });
  it("isAdjusted nhận ra khi đã chỉnh và khi về 0", () => {
    expect(isAdjusted(NO_ADJUST)).toBe(false);
    expect(isAdjusted(nudgeAdjust(nudgeAdjust(NO_ADJUST, "start", 0.1), "start", -0.1))).toBe(false);
    expect(isAdjusted({ start: 0, end: 0.1 })).toBe(true);
  });
});
