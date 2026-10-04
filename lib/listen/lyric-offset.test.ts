import { describe, expect, it } from "vitest";
import { addToDefaultOffset, estimateSyncRisk, normalizeOffset, parseOffsetEntries, resolveOffset, offsetFromLineClick, parseOffsets, shiftLines } from "./lyric-offset";

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

describe("addToDefaultOffset", () => {
  it("cộng độ lệch admin chỉnh thêm lên mặc định hiện có, làm tròn 0,05", () => {
    expect(addToDefaultOffset(0, 1.2)).toBe(1.2);
    expect(addToDefaultOffset(1.5, -0.4)).toBe(1.1);
    expect(addToDefaultOffset(0.3, 0.12)).toBe(0.4);
  });
  it("kẹp trong ±60 giây và coi giá trị không hợp lệ như 0", () => {
    expect(addToDefaultOffset(59, 5)).toBe(60);
    expect(addToDefaultOffset(-59, -5)).toBe(-60);
    expect(addToDefaultOffset(2, NaN)).toBe(0);
  });
});

describe("parseOffsetEntries", () => {
  it("đọc dạng cũ (một số) với base 0 và dạng mới {o, base}", () => {
    expect(parseOffsetEntries(JSON.stringify({ a: 1.2, b: { o: 0.5, base: 23 } }))).toEqual({ a: { o: 1.2, base: 0 }, b: { o: 0.5, base: 23 } });
  });
  it("bỏ mục sai kiểu và dữ liệu hỏng", () => {
    expect(parseOffsetEntries(JSON.stringify({ a: "x", b: { o: 1 }, c: null }))).toEqual({});
    expect(parseOffsetEntries("không phải json")).toEqual({});
    expect(parseOffsetEntries(null)).toEqual({});
  });
});

describe("resolveOffset", () => {
  it("chưa chỉnh → undefined", () => {
    expect(resolveOffset(undefined, 23)).toBeUndefined();
  });
  it("bản chỉnh còn hợp lệ khi mức mặc định không đổi kể từ lúc chỉnh", () => {
    expect(resolveOffset({ o: 2, base: 0 }, 0)).toBe(2);
    expect(resolveOffset({ o: -1.5, base: 23 }, 23)).toBe(-1.5);
  });
  it("admin đổi mức mặc định sau lúc người dùng chỉnh → bản chỉnh cũ bị bỏ (về 0), không cộng đôi", () => {
    expect(resolveOffset({ o: 23, base: 0 }, 23)).toBe(0);
    expect(resolveOffset({ o: 2, base: 10 }, 0)).toBe(0);
  });
  it("chưa biết mức mặc định hiện tại → tin bản đang lưu", () => {
    expect(resolveOffset({ o: 4, base: 0 }, undefined)).toBe(4);
  });
});
