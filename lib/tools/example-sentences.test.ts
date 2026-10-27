import { describe, expect, it } from "vitest";
import type { ExampleSentence } from "@/lib/courses/course-types";
import { normalizeExampleQuery, splitByTerm, toExampleItems } from "./example-sentences";

const s = (over: Partial<ExampleSentence> = {}): ExampleSentence => ({ videoId: "abc_123", lineIdx: 3, start: 84.7, end: 90, text: "我喜欢苹果。", pinyin: "wǒ xǐhuan píngguǒ.", translation: "Tôi thích táo.", quality: 80, ...over });

describe("normalizeExampleQuery", () => {
  it("chỉ giữ chữ Hán, cắt 6 chữ và đổi về giản thể", () => {
    expect(normalizeExampleQuery(" 喜欢! ")).toBe("喜欢");
    expect(normalizeExampleQuery("一二三四五六七八")).toBe("一二三四五六");
    expect(normalizeExampleQuery("學習")).toBe("学习");
    expect(normalizeExampleQuery("xihuan 123")).toBe("");
  });
});

describe("toExampleItems", () => {
  it("không lộ điểm chất lượng, tạo đường dẫn mở video đúng giây và giới hạn số câu", () => {
    const [item] = toExampleItems([s()]);
    expect(item).toEqual({ text: "我喜欢苹果。", pinyin: "wǒ xǐhuan píngguǒ.", translation: "Tôi thích táo.", watchPath: "/video/abc_123?t=84" });
    expect(toExampleItems(Array.from({ length: 9 }, () => s()), 3)).toHaveLength(3);
  });
});

describe("splitByTerm", () => {
  it("tô sáng mọi chỗ xuất hiện và giữ phần còn lại", () => {
    expect(splitByTerm("我喜欢苹果,也喜欢香蕉。", "喜欢")).toEqual([
      { text: "我", hit: false }, { text: "喜欢", hit: true }, { text: "苹果,也", hit: false }, { text: "喜欢", hit: true }, { text: "香蕉。", hit: false },
    ]);
  });
  it("không có từ thì trả nguyên câu", () => {
    expect(splitByTerm("你好", "再见")).toEqual([{ text: "你好", hit: false }]);
    expect(splitByTerm("你好", "")).toEqual([{ text: "你好", hit: false }]);
  });
});
