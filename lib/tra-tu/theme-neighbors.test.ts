import { describe, expect, it } from "vitest";
import { HSK1_THEMES } from "@/lib/courses/hsk1-themes";
import { themeNeighbors } from "./theme-neighbors";

describe("themeNeighbors", () => {
  it("từ HSK 1 lấy các từ cùng chủ đề, không gồm chính nó, từ nhiều chữ trước", () => {
    const theme = HSK1_THEMES.find((t) => t.id === "family")!;
    const r = themeNeighbors("爸爸", 5)!;
    expect(r.level).toBe(1);
    expect(r.themeTitle).toBe(theme.title);
    expect(r.words).not.toContain("爸爸");
    expect(r.words.length).toBeLessThanOrEqual(5);
    expect([...r.words[0]].length).toBeGreaterThanOrEqual([...r.words.at(-1)!].length);
  });
  it("từ HSK 2+ lấy chủ đề từ bảng đã duyệt", () => {
    const r = themeNeighbors("秋天", 100)!;
    expect(r.themeTitle).toBe("Thời gian và tần suất");
    expect(r.words).toContain("春天");
  });
  it("từ không có trong bảng thì null", () => {
    expect(themeNeighbors("龘龘")).toBeNull();
  });
});
