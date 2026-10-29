import { describe, expect, it } from "vitest";
import { combine, forgeProgress, hint, parseFound, parsePair, pairKey, pickStart, reachable, type Recipe } from "./radical-forge";

const R = (a: string, b: string, out: string): Recipe => ({ a, b, out });
const RECIPES = [R("日", "月", "明"), R("木", "木", "林"), R("林", "木", "森"), R("木", "口", "杏"), R("口", "木", "呆"), R("明", "森", "X"), R("鬼", "鬼", "魑")];

describe("parsePair", () => {
  it("chỉ nhận cấu tạo hai ký tự trái-phải hoặc trên-dưới", () => {
    expect(parsePair("⿰日月")).toEqual(["日", "月"]);
    expect(parsePair("⿱木口")).toEqual(["木", "口"]);
    expect(parsePair("⿲亻一丨")).toBeNull();
    expect(parsePair("⿴囗大")).toBeNull();
    expect(parsePair("⿰日？")).toBeNull();
    expect(parsePair("⿰日⿱月口")).toBeNull();
    expect(parsePair(null)).toBeNull();
  });
});

describe("ghép và gợi ý", () => {
  it("không phân biệt thứ tự; một cặp ra nhiều chữ", () => {
    expect(combine(RECIPES, "月", "日")).toEqual(["明"]);
    expect(combine(RECIPES, "口", "木").sort()).toEqual(["呆", "杏"]);
    expect(combine(RECIPES, "日", "木")).toEqual([]);
    expect(pairKey("b", "a")).toBe(pairKey("a", "b"));
  });
  it("tính được chữ tới được từ bộ ban đầu", () => {
    const have = reachable(RECIPES, ["日", "月", "木", "口"]);
    expect([...have].sort()).toEqual(["口", "日", "明", "月", "木", "杏", "林", "森", "呆", "X"].sort());
    expect(have.has("魑")).toBe(false);
  });
  it("chọn bộ đầu tham lam: mảnh mở được nhiều chữ nhất trước, bỏ công thức không tới được", () => {
    const one = pickStart(RECIPES, 1);
    expect(one.start).toEqual(["木"]);
    expect(one.recipes.map((r) => r.out).sort()).toEqual(["林", "森"]);
    const all = pickStart(RECIPES, 5);
    expect(all.start).toContain("木");
    expect(all.recipes.map((r) => r.out)).toContain("明");
  });
  it("gợi ý chỉ ra công thức đã đủ mảnh mà chưa tìm", () => {
    const found = new Set(["日", "月", "木"]);
    expect(hint(RECIPES, found)?.out).toBe("明");
    expect(hint(RECIPES, new Set(["日", "月", "木", "口", "明", "林", "森", "杏", "呆", "X"]))).toBeNull();
    expect(hint(RECIPES, new Set(["木"]), () => 99)?.out).toBe("林");
  });
  it("tiến độ không tính bộ ban đầu", () => {
    expect(forgeProgress(RECIPES, new Set(["日", "月", "明"]))).toEqual({ done: 1, total: 7 });
  });
  it("đọc dữ liệu đã lưu an toàn", () => {
    expect(parseFound(["木", "木", 3, "ab", "日"])).toEqual(["木", "日"]);
    expect(parseFound("x")).toEqual([]);
  });
});
