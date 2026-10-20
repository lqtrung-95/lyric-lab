import { describe, expect, it } from "vitest";
import { HSK_THEME_TAXONOMY, parseThemeAssignment, themesFromAssignment } from "./hsk-theme-taxonomy";

describe("parseThemeAssignment", () => {
  it("giữ từ có mã chủ đề hợp lệ và báo thiếu những từ còn lại", () => {
    const raw = '```json\n{"苹果":"food","奇怪":"nope","学校":"school"}\n```';
    const out = parseThemeAssignment(raw, ["苹果", "奇怪", "学校", "医院"]);
    expect(out.assigned).toEqual({ 苹果: "food", 学校: "school" });
    expect(out.missing).toEqual(["奇怪", "医院"]);
  });
  it("JSON hỏng thì coi như thiếu hết", () => {
    expect(parseThemeAssignment("không phải json", ["a"]).missing).toEqual(["a"]);
  });
  it("mã chủ đề không trùng nhau", () => {
    expect(new Set(HSK_THEME_TAXONOMY.map((t) => t.id)).size).toBe(HSK_THEME_TAXONOMY.length);
  });
});

describe("themesFromAssignment", () => {
  it("theo thứ tự bộ chủ đề chung, bỏ chủ đề trống và mã lạ", () => {
    const themes = themesFromAssignment({ school: ["考试"], food: ["苹果"], bogus: ["x"], work: [] });
    expect(themes.map((t) => t.id)).toEqual(["food", "school"]);
  });
});
