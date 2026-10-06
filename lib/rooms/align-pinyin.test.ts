import { describe, expect, it } from "vitest";
import { alignPinyinToText } from "./align-pinyin";

describe("alignPinyinToText", () => {
  it("ghép từng âm tiết vào từng chữ Hán theo thứ tự", () => {
    expect(alignPinyinToText("心中总有", "xīn zhōng zǒng yǒu")).toEqual([
      { ch: "心", py: "xīn" }, { ch: "中", py: "zhōng" }, { ch: "总", py: "zǒng" }, { ch: "有", py: "yǒu" },
    ]);
  });
  it("ký tự không phải chữ Hán không nhận âm tiết; token dấu câu trong pinyin bị bỏ qua", () => {
    expect(alignPinyinToText("你, 好", "nǐ , hǎo")).toEqual([
      { ch: "你", py: "nǐ" }, { ch: ",", py: null }, { ch: " ", py: null }, { ch: "好", py: "hǎo" },
    ]);
  });
  it("phần rỗng (ô trống ở đầu/cuối dòng) trả mảng rỗng", () => {
    expect(alignPinyinToText("", "")).toEqual([]);
  });
  it("trả null khi số âm tiết không khớp số chữ Hán hoặc không có pinyin", () => {
    expect(alignPinyinToText("心中", "xīn")).toBeNull();
    expect(alignPinyinToText("心中", null)).toBeNull();
  });
});
