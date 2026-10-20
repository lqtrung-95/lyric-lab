import { describe, expect, it } from "vitest";
import { buildPlacementQuestions, scorePlacement, type PlacementWord } from "./placement";

const seeded = () => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const pool = (level: number): PlacementWord[] => Array.from({ length: 8 }, (_, i) => ({ term: `L${level}w${i}`, pinyin: "p", gloss: `nghĩa ${level}-${i}` }));
const byLevel = Object.fromEntries([1, 2, 3, 4, 5, 6].map((l) => [l, pool(l)]));

describe("buildPlacementQuestions", () => {
  it("5 câu mỗi cấp, xếp từ cấp thấp lên cao, đủ 4 lựa chọn gồm đáp án đúng", () => {
    const qs = buildPlacementQuestions(byLevel, seeded());
    expect(qs).toHaveLength(30);
    expect(qs.map((q) => q.level)).toEqual([...qs.map((q) => q.level)].sort((a, b) => a - b));
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(q.options).toContain(q.answer);
      expect(new Set(q.options).size).toBe(4);
    }
  });
  it("cấp thiếu từ thì bỏ qua cấp đó", () => {
    expect(buildPlacementQuestions({ 1: pool(1), 2: pool(2).slice(0, 2) }, seeded()).every((q) => q.level === 1)).toBe(true);
  });
});

describe("scorePlacement", () => {
  const qs = buildPlacementQuestions(byLevel, seeded());
  const answerLevels = (right: number[]) => qs.map((q) => (right.includes(q.level) ? q.answer : null));
  it("bắt đầu ở cấp đầu tiên chưa đạt 60%", () => {
    expect(scorePlacement(qs, answerLevels([1, 2, 3])).startLevel).toBe(4);
    expect(scorePlacement(qs, answerLevels([])).startLevel).toBe(1);
  });
  it("nắm hết thì bắt đầu ở cấp cao nhất đã hỏi; 'Chưa biết' (null) tính là sai", () => {
    expect(scorePlacement(qs, answerLevels([1, 2, 3, 4, 5, 6])).startLevel).toBe(6);
    const r = scorePlacement(qs, answerLevels([1, 2]));
    expect(r.byLevel[1]).toBe(1);
    expect(r.byLevel[3]).toBe(0);
  });
});
