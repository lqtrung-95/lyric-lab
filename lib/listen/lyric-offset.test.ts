import { describe, expect, it } from "vitest";
import { estimateSyncRisk, normalizeOffset, offsetFromLineClick, parseOffsets, shiftLines } from "./lyric-offset";

const line = (start: number, end: number) => ({ start, end });

describe("normalizeOffset", () => {
  it("làm tròn 0,05 và kẹp ±60", () => {
    expect(normalizeOffset(1.23)).toBe(1.25);
    expect(normalizeOffset(-0.02)).toBe(-0);
    expect(normalizeOffset(999)).toBe(60);
    expect(normalizeOffset(-999)).toBe(-60);
    expect(normalizeOffset(NaN)).toBe(0);
  });
});

describe("shiftLines", () => {
  it("dịch start/end, không âm, và trả nguyên mảng khi lệch 0", () => {
    const lines = [line(1, 3), line(10, 12)];
    expect(shiftLines(lines, 0)).toBe(lines);
    expect(shiftLines(lines, 2)).toEqual([line(3, 5), line(12, 14)]);
    expect(shiftLines(lines, -2)).toEqual([line(0, 1), line(8, 10)]);
  });
});

describe("offsetFromLineClick", () => {
  it("bấm dòng bắt đầu ở 10s khi video đang ở 15,25s → lệch +5 (đã bù 0,25s phản xạ)", () => {
    expect(offsetFromLineClick(15.25, 10)).toBe(5);
  });

  it("lời hiện sớm hơn nhạc thì lệch âm", () => {
    expect(offsetFromLineClick(8.25, 10)).toBe(-2);
  });
});

describe("estimateSyncRisk", () => {
  it("bình thường: lời kết thúc hơi trước khi video hết", () => {
    expect(estimateSyncRisk([line(0, 200)], 230)).toBe("none");
  });

  it("lời dài hơn video hoặc kết thúc quá sớm thì cảnh báo", () => {
    expect(estimateSyncRisk([line(0, 240)], 230)).toBe("likely_off");
    expect(estimateSyncRisk([line(0, 150)], 230)).toBe("likely_off");
  });

  it("không có dữ liệu thì không cảnh báo", () => {
    expect(estimateSyncRisk([], 230)).toBe("none");
    expect(estimateSyncRisk([line(0, 10)], 0)).toBe("none");
  });
});

describe("parseOffsets", () => {
  it("đọc bảng hợp lệ, bỏ mục sai kiểu, chịu được JSON hỏng", () => {
    expect(parseOffsets('{"a":1.2,"b":"x","c":null,"d":99}')).toEqual({ a: 1.2, d: 60 });
    expect(parseOffsets("không phải json")).toEqual({});
    expect(parseOffsets(null)).toEqual({});
    expect(parseOffsets("[1,2]")).toEqual({});
  });
});
