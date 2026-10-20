import { describe, expect, it } from "vitest";
import { generateHskUnits, splitEvenly, withReviewUnits } from "./generate-hsk-units";
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

describe("withReviewUnits", () => {
  const unit = (n: number) => ({ title: `Chặng ${n}`, topic: "t", terms: [`w${n}`], summary: "s" });
  const plan = (n: number, every: number, final = true) => withReviewUnits(Array.from({ length: n }, (_, i) => unit(i + 1)), "HSK 2", every, final);

  it("chèn một chặng ôn sau mỗi nhóm, đánh số theo cả khóa, và kiểm tra cuối cấp ở cuối", () => {
    const out = plan(10, 5);
    expect(out.map((u) => u.kind === "hsk" ? "h" : u.kind === "review" && u.variant === "final" ? "F" : "C").join("")).toBe("hhhhhChhhhhCF");
    expect(out[5]).toMatchObject({ kind: "review", variant: "checkpoint", from: 1, to: 5, title: "Ôn tập chặng 1–5" });
    expect(out[11]).toMatchObject({ from: 7, to: 11 });
    expect(out.at(-1)).toMatchObject({ variant: "final", title: "Kiểm tra cuối cấp HSK 2" });
  });
  it("chặng lẻ cuối dưới nửa nhóm thì gộp vào lượt ôn cuối, không có lượt ôn riêng", () => {
    const out = plan(11, 5); // 5 + 6: chặng 11 gộp vào nhóm hai
    expect(out.filter((u) => u.kind === "review" && u.variant === "checkpoint")).toHaveLength(2);
    expect(out.at(-2)).toMatchObject({ variant: "checkpoint", from: 7, to: 12 });
  });
  it("every = 0: không có chặng ôn giữa khóa; final = false: không có bài cuối cấp", () => {
    expect(plan(4, 0, false).every((u) => u.kind === "hsk")).toBe(true);
    expect(plan(4, 0).at(-1)).toMatchObject({ variant: "final" });
  });
});
