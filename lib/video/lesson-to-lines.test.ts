import { describe, expect, it } from "vitest";
import { lessonLinesToAnalyzed } from "./lesson-to-lines";

describe("lessonLinesToAnalyzed", () => {
  it("đổi idx thành index, null thành không có bản dịch và giữ token", () => {
    const out = lessonLinesToAnalyzed([
      { idx: 3, start: 1, end: 2, text: "你好", pinyin: "nǐ hǎo", translation: null, tokens: [{ text: "你好" }] },
      { idx: 4, start: 2, end: 3, text: "再见", pinyin: "zài jiàn", translation: "Tạm biệt", tokens: [{ text: "再见" }] },
    ]);
    expect(out[0]).toEqual({ index: 3, text: "你好", start: 1, end: 2, pinyin: "nǐ hǎo", translation: undefined, tokens: [{ text: "你好" }] });
    expect(out[1].translation).toBe("Tạm biệt");
  });
});
