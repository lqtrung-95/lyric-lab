import { describe, expect, it } from "vitest";
import { classifyQuery } from "./classify-query";

describe("classifyQuery", () => {
  it("có chữ Hán thì chỉ tìm theo chữ, giữ thứ tự", () => {
    expect(classifyQuery(" 喜欢 abc ")).toMatchObject({ han: "喜欢", folded: null, plainPinyin: null });
  });
  it("chữ Latin: gập dấu tiếng Việt và tính pinyin phẳng", () => {
    expect(classifyQuery("Thành Thị")).toMatchObject({ han: null, folded: "thanh thi" });
    expect(classifyQuery("xǐ huan")).toMatchObject({ folded: "xi huan", plainPinyin: "xihuan" });
  });
  it("rỗng hoặc chỉ ký hiệu thì không có nguồn nào", () => {
    expect(classifyQuery("   ")).toMatchObject({ han: null, folded: null });
    expect(classifyQuery("?!")).toMatchObject({ han: null, folded: null });
  });
  it("cắt truy vấn quá dài", () => {
    expect(classifyQuery("a".repeat(100)).raw.length).toBe(40);
  });
});
