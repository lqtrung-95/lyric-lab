import { describe, expect, it } from "vitest";
import { classifyTimestamps } from "./timestamp-precision";

const L = (start: number, end: number) => ({ start, end });

describe("classifyTimestamps", () => {
  it("mọi mốc là số nguyên thì là giây", () => {
    expect(classifyTimestamps([L(1, 4), L(4, 9), L(9, 12)])).toMatchObject({ precision: "seconds", fractionalLines: 0, lines: 3 });
  });
  it("đa số câu có mốc lẻ thì là mili giây (kể cả vài câu tình cờ tròn giây)", () => {
    expect(classifyTimestamps([L(1.24, 3.8), L(4, 6.5), L(7.12, 9), L(9.3, 12)]).precision).toBe("ms");
  });
  it("chỉ một ít câu lẻ thì là mixed", () => {
    const lines = Array.from({ length: 20 }, (_, i) => L(i * 3, i * 3 + 2));
    lines[5] = L(15.5, 17);
    expect(classifyTimestamps(lines).precision).toBe("mixed");
  });
  it("không có câu nào thì là none; bỏ qua giá trị không hợp lệ", () => {
    expect(classifyTimestamps([]).precision).toBe("none");
    expect(classifyTimestamps([L(Number.NaN, 2)]).precision).toBe("seconds");
  });
  it("sai số dấu phẩy động rất nhỏ không tính là lẻ", () => {
    expect(classifyTimestamps([L(3.0000000001, 5)]).precision).toBe("seconds");
  });
});
