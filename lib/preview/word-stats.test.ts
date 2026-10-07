import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { collectWordStats, distinctHanTerms, levelFromRows } from "./word-stats";

const row = (pinyin: string, hsk: number | null): DictWordRow => ({ simplified: "x", traditional: "x", pinyin, meanings: [], hsk_level: hsk, frequency: null });
const tok = (text: string, itemId?: string) => ({ text, itemId });

describe("word stats", () => {
  it("lấy cấp HSK thấp nhất, bỏ mục họ người nếu có mục thường", () => {
    expect(levelFromRows([row("Dū", 6), row("dōu", 1)])).toBe(1);
    expect(levelFromRows([row("Dū", 6)])).toBe(6);
    expect(levelFromRows([row("a", null)])).toBeNull();
    expect(levelFromRows(undefined)).toBeNull();
  });
  it("liệt kê từ chữ Hán khác nhau, bỏ dấu câu và chữ Latin", () => {
    expect(distinctHanTerms([{ tokens: [tok("我"), tok("，"), tok("love"), tok("你")] }, { tokens: [tok("我")] }])).toEqual(["我", "你"]);
  });
  it("gom theo từ và mục từ vựng, đếm số lần", () => {
    const stats = collectWordStats([{ tokens: [tok("永远", "a"), tok("我"), tok("永远", "a")] }], (t) => (t === "我" ? 1 : 4));
    expect(stats).toEqual([{ term: "永远", level: 4, itemId: "a", count: 2 }, { term: "我", level: 1, itemId: undefined, count: 1 }]);
  });
});
