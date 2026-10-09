import { describe, expect, it } from "vitest";
import { balancedWrapText, wrapText } from "./wrap-text";

const measure = (s: string) => [...s].length * 10;

describe("wrapText", () => {
  it("ngắt chữ Hán theo ký tự", () => {
    expect(wrapText("一二三四五六", measure, 30, "char")).toEqual(["一二三", "四五六"]);
  });
  it("ngắt theo từ, giữ từ dài trên một dòng", () => {
    expect(wrapText("aaa bb cc dddddddd", measure, 60, "word")).toEqual(["aaa bb", "cc", "dddddddd"]);
  });
  it("chuỗi rỗng không có dòng nào", () => {
    expect(wrapText("", measure, 30, "word")).toEqual([]);
  });
});

describe("balancedWrapText", () => {
  it("chia đều chữ Hán thay vì để dòng cuối lẻ loi", () => {
    expect(wrapText("一二三四五六七八九", measure, 80, "char")).toEqual(["一二三四五六七八", "九"]);
    expect(balancedWrapText("一二三四五六七八九", measure, 80, "char")).toEqual(["一二三四五", "六七八九"]);
  });
  it("giữ nguyên khi chỉ có một dòng hoặc rỗng", () => {
    expect(balancedWrapText("一二三", measure, 80, "char")).toEqual(["一二三"]);
    expect(balancedWrapText("", measure, 80, "word")).toEqual([]);
  });
  it("không bao giờ tăng số dòng và không tách từ", () => {
    const text = "aaa bbb cc dddd ee ffff g";
    const greedy = wrapText(text, measure, 100, "word");
    const balanced = balancedWrapText(text, measure, 100, "word");
    expect(balanced.length).toBe(greedy.length);
    expect(balanced.join(" ")).toBe(text);
    expect(Math.max(...balanced.map(measure))).toBeLessThanOrEqual(Math.max(...greedy.map(measure)));
  });
});
