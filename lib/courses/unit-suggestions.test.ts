import { describe, expect, it } from "vitest";
import { detectGrammar } from "@/lib/grammar/detect-grammar";
import { courseLevel, suggestGrammar, suggestScenes } from "./unit-suggestions";

const scene = (id: string, terms: string[]) => ({ id, title: id, objects: terms.map((term) => ({ term })) });

describe("courseLevel", () => {
  it("đọc cấp từ slug khóa HSK", () => {
    expect(courseLevel("hsk-3")).toBe(3);
    expect(courseLevel("hsk1")).toBe(1);
    expect(courseLevel("situation-cafe")).toBeNull();
    expect(courseLevel("hsk-9")).toBe(6);
  });
});

describe("suggestScenes", () => {
  const scenes = [scene("a", ["猫", "狗", "鱼", "鸟"]), scene("b", ["猫", "桌"]), scene("c", ["猫"]), scene("d", ["猫", "狗"])];
  it("chỉ gợi ý khi trùng đủ số từ, nhiều từ trùng trước, ngang nhau thì cảnh ít vật hơn trước", () => {
    expect(suggestScenes(["猫", "狗"], scenes).map((s) => s.id)).toEqual(["d", "a"]);
    expect(suggestScenes(["猫", "桌"], scenes).map((s) => s.id)).toEqual(["b"]);
  });
  it("một từ trùng là chưa đủ; không có từ thì rỗng; giới hạn số cảnh", () => {
    expect(suggestScenes(["桌"], scenes)).toEqual([]);
    expect(suggestScenes([], scenes)).toEqual([]);
    expect(suggestScenes(["猫", "狗", "鱼"], scenes, 1)).toHaveLength(1);
  });
});

describe("suggestGrammar", () => {
  const lines = ["请把门关上", "他把书放下了", "今天比昨天冷", "天气越来越冷"];
  it("đếm mẫu theo số câu, kèm câu ví dụ, mẫu gặp nhiều nhất trước", () => {
    const r = suggestGrammar(lines, 6, detectGrammar, 5);
    expect(r[0].pattern.id).toBe("ba");
    expect(r[0].sentence).toBe("请把门关上");
    expect(r.map((x) => x.pattern.id)).toContain("bi");
  });
  it("bỏ mẫu cao hơn cấp khóa quá một bậc", () => {
    const r = suggestGrammar(lines, 1, detectGrammar, 5);
    expect(r.every((x) => x.pattern.level <= 2)).toBe(true);
    expect(r.map((x) => x.pattern.id)).not.toContain("ba");
  });
  it("không có câu thì rỗng", () => { expect(suggestGrammar([], 3, detectGrammar)).toEqual([]); });
});
