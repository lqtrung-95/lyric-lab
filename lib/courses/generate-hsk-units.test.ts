import { describe, expect, it } from "vitest";
import { generateHskUnits, splitEvenly } from "./generate-hsk-units";
import { HSK1_THEMES } from "./hsk1-themes";

const word = (simplified: string, frequency: number) => ({ simplified, frequency });
const themes = [{ id: "a", title: "Chủ đề A", words: ["我", "你", "他", "不存在"] }, { id: "b", title: "Chủ đề B", words: ["你", "好"] }];

describe("splitEvenly", () => {
  it("chia đều, không để đoạn cuối lẻ", () => {
    expect(splitEvenly(Array.from({ length: 20 }, (_, i) => i), 18).map((p) => p.length)).toEqual([10, 10]);
    expect(splitEvenly([1, 2, 3], 18)).toEqual([[1, 2, 3]]);
    expect(splitEvenly(Array.from({ length: 37 }, (_, i) => i), 18).map((p) => p.length)).toEqual([13, 13, 11]);
  });
});

describe("generateHskUnits", () => {
  const words = [word("我", 100), word("你", 90), word("他", 80), word("好", 70), word("书", 5), word("水", 4)];
  it("mỗi từ đúng một lần; từ ngoài danh sách bị bỏ; từ trùng giữa chủ đề thuộc chủ đề đầu", () => {
    const units = generateHskUnits(words, themes, "HSK 1");
    const all = units.flatMap((u) => u.terms);
    expect(all.sort()).toEqual(words.map((w) => w.simplified).sort());
    expect(units[0]).toMatchObject({ title: "Chủ đề A", terms: ["我", "你", "他"] });
    expect(units[1]).toMatchObject({ title: "Chủ đề B", terms: ["好"] });
  });
  it("từ không thuộc chủ đề vào chặng 'từ thông dụng khác' theo tần suất giảm dần", () => {
    const last = generateHskUnits(words, themes, "HSK 1").at(-1)!;
    expect(last.title).toBe("Từ thông dụng khác");
    expect(last.terms).toEqual(["书", "水"]);
  });
  it("chủ đề lớn chia thành (1), (2) và không vượt quá số từ tối đa", () => {
    const many = Array.from({ length: 30 }, (_, i) => `字${i}`);
    const units = generateHskUnits(many.map((m, i) => word(m, 100 - i)), [{ id: "x", title: "Lớn", words: many }], "HSK 1", 18);
    expect(units.map((u) => u.title)).toEqual(["Lớn (1)", "Lớn (2)"]);
    expect(units.every((u) => u.terms.length <= 18)).toBe(true);
  });
  it("kết quả xác định", () => {
    expect(generateHskUnits(words, themes, "HSK 1")).toEqual(generateHskUnits(words, themes, "HSK 1"));
  });
});

describe("HSK1_THEMES", () => {
  it("không có id trùng; mỗi chủ đề có từ", () => {
    expect(new Set(HSK1_THEMES.map((t) => t.id)).size).toBe(HSK1_THEMES.length);
    expect(HSK1_THEMES.every((t) => t.words.length > 0)).toBe(true);
  });
});
