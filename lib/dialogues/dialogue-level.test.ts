import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { dialogueLevel } from "./dialogue-level";

const row = (simplified: string, hsk_level: number | null): DictWordRow => ({ simplified, traditional: simplified, pinyin: "x", meanings: ["m"], hsk_level, frequency: null });
const dict = (entries: [string, number | null][]) => new Map(entries.map(([w, l]) => [w, [row(w, l)]]));

describe("dialogueLevel", () => {
  it("lấy cấp nhỏ nhất bao phủ 90% từ có cấp", () => {
    const words = ["你", "好", "吃", "喝", "去", "来", "看", "说", "要", "有"]; // 10 từ cấp 1
    const d = dict(words.map((w) => [w, 1] as [string, number]));
    expect(dialogueLevel(words, d)).toBe(1);
  });

  it("một từ hiếm (1/10) không đẩy cả bài lên cấp cao", () => {
    const words = ["你", "好", "吃", "喝", "去", "来", "看", "说", "要", "难题"];
    const d = dict([...words.slice(0, 9).map((w) => [w, 1] as [string, number]), ["难题", 6]]);
    expect(dialogueLevel(words, d)).toBe(1);
  });

  it("nhiều từ cấp cao thì ra cấp cao; từ cấp ≥ 6 gộp nhóm 6", () => {
    const d = dict([["甲", 2], ["乙", 7], ["丙", 5]]);
    expect(dialogueLevel(["甲", "乙", "丙"], d)).toBe(6);
  });

  it("từ ghép chưa có thì lấy cấp cao nhất của các đoạn con; không có cấp nào thì null", () => {
    const d = dict([["提", 3], ["示", 4]]);
    expect(dialogueLevel(["提示"], d)).toBe(4);
    expect(dialogueLevel(["张三"], dict([]))).toBeNull();
  });
});
