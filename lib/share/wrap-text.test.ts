import { describe, expect, it } from "vitest";
import { wrapText } from "./wrap-text";

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
