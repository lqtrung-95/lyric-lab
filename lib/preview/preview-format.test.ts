import { describe, expect, it } from "vitest";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { displayTermForm, formatTimestamp, levelLabel, levelRangeLabel, lineForItem, snippetRange } from "./preview-format";

const line = (index: number, text: string, itemId?: string): AnalyzedLine => ({
  index, text, start: index * 5, end: index * 5 + 5, pinyin: "", tokens: [{ text, itemId }],
});

describe("preview format", () => {
  it("formatTimestamp", () => {
    expect(formatTimestamp(5)).toBe("0:05");
    expect(formatTimestamp(65.9)).toBe("1:05");
    expect(formatTimestamp(-3)).toBe("0:00");
  });

  it("levelLabel và levelRangeLabel", () => {
    expect(levelLabel(3)).toBe("HSK 3");
    expect(levelLabel(7)).toBe("HSK 7–9");
    expect(levelLabel(null)).toBe("Ngoài HSK");
    expect(levelRangeLabel([{ level: 3 }, { level: 5 }, { level: null }])).toBe("HSK 3–5");
    expect(levelRangeLabel([{ level: 4 }])).toBe("HSK 4");
    expect(levelRangeLabel([{ level: 3 }, { level: 7 }])).toBe("HSK 3–7–9");
    expect(levelRangeLabel([{ level: null }])).toBe("");
  });

  it("displayTermForm lấy dạng phồn thể trong lời", () => {
    const lines = [line(0, "窗外"), line(1, "離開", "vocab:离开")];
    expect(displayTermForm({ id: "vocab:离开", type: "vocab", term: "离开" }, lines)).toBe("離開");
    expect(displayTermForm({ id: "vocab:x", type: "vocab", term: "x" }, lines)).toBe("x");
    expect(displayTermForm({ id: "grammar:0", type: "grammar", term: "A 比 B" }, lines)).toBe("A 比 B");
  });

  it("lineForItem lấy dòng xuất hiện đầu tiên", () => {
    expect(lineForItem({ occurrences: [{ lineIndex: 1, start: 5 }] }, [line(0, "a"), line(1, "b")])?.text).toBe("b");
    expect(lineForItem({ occurrences: [] }, [line(0, "a")])).toBeNull();
  });

  it("snippetRange lùi 0,3 giây, dài tối đa 8 giây", () => {
    expect(snippetRange({ start: 5, end: 10 })).toEqual({ start: 4.7, end: 10.3 });
    expect(snippetRange({ start: 0.1, end: 3 }).start).toBe(0);
    const long = snippetRange({ start: 10, end: 40 });
    expect(long.end - long.start).toBeCloseTo(8);
  });
});
