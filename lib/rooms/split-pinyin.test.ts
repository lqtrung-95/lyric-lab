import { describe, expect, it } from "vitest";
import { splitPinyinAroundTerm } from "./split-pinyin";

describe("splitPinyinAroundTerm", () => {
  const line = "jiùsuàn lù zài yuǎn wǒ yě bù pà";
  it("tách phần trước và sau cách đọc của từ một âm tiết", () => {
    expect(splitPinyinAroundTerm(line, "yuǎn")).toEqual({ before: "jiùsuàn lù zài", after: "wǒ yě bù pà" });
  });
  it("khớp từ nhiều âm tiết dù cách đọc có hoặc không có dấu cách", () => {
    expect(splitPinyinAroundTerm(line, "jiùsuàn")).toEqual({ before: "", after: "lù zài yuǎn wǒ yě bù pà" });
    expect(splitPinyinAroundTerm("wǒ xǐhuan nǐ hěn jiǔ", "xǐ huan")).toEqual({ before: "wǒ", after: "nǐ hěn jiǔ" });
  });
  it("không phân biệt hoa thường và bỏ dấu nháy", () => {
    expect(splitPinyinAroundTerm("Wǒ ài nǐ", "AI")).toBeNull(); // thiếu dấu thanh thì không khớp ài
    expect(splitPinyinAroundTerm("Wǒ ài nǐ", "ài")).toEqual({ before: "Wǒ", after: "nǐ" });
    expect(splitPinyinAroundTerm("xī'ān hěn dà", "xi'an")).toBeNull();
    expect(splitPinyinAroundTerm("xī'ān hěn dà", "xī'ān")).toEqual({ before: "", after: "hěn dà" });
  });
  it("trả null khi không tìm thấy hoặc thiếu cách đọc", () => {
    expect(splitPinyinAroundTerm(line, "nán")).toBeNull();
    expect(splitPinyinAroundTerm(line, null)).toBeNull();
    expect(splitPinyinAroundTerm(line, "")).toBeNull();
    expect(splitPinyinAroundTerm("", "yuǎn")).toBeNull();
  });
});
