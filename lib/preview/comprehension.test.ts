import { describe, expect, it } from "vitest";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { computeComprehension } from "./comprehension";
import type { WordStat } from "./word-stats";

const item = (id: string, term: string, level: number | null = 4): PreviewItem => ({ id, type: "vocab", term, level, meaningInContext: "x", occurrences: [], priority: 1 });
const w = (term: string, level: number | null, count: number, itemId?: string): WordStat => ({ term, level, itemId, count });
const none = new Set<string>();

describe("computeComprehension", () => {
  it("null khi bài không có chữ Hán", () => {
    expect(computeComprehension([], [], { userLevel: 1, known: none })).toBeNull();
  });

  it("người mới (HSK 1) bắt đầu gần 0%, kể cả với từ cơ bản không nằm trong từ cốt lõi", () => {
    const words = [w("我", 1, 10), w("你", 1, 10), w("永远", 4, 2, "a")];
    const r = computeComprehension(words, [item("a", "永远")], { userLevel: 1, known: none })!;
    expect(r.percent).toBe(0);
  });

  it("level N coi các từ HSK thấp hơn N là đã hiểu", () => {
    const words = [w("我", 1, 10), w("爱", 2, 10), w("永远", 4, 5, "a"), w("发现", 5, 5)];
    expect(computeComprehension(words, [item("a", "永远")], { userLevel: 3, known: none })!.percent).toBe(67); // 20/30
    expect(computeComprehension(words, [item("a", "永远")], { userLevel: 2, known: none })!.percent).toBe(33); // 10/30
  });

  it("từ cốt lõi đã đánh dấu đã biết được tính là hiểu", () => {
    const words = [w("永远", 4, 5, "a"), w("我", 1, 5)];
    const r = computeComprehension(words, [item("a", "永远")], { userLevel: 1, known: new Set(["vocab:永远"]) })!;
    expect(r.percent).toBe(50);
  });

  it("từ ngoài HSK hoặc không tra được là chưa hiểu", () => {
    expect(computeComprehension([w("某某", null, 4), w("我", 1, 6)], [], { userLevel: 2, known: none })!.percent).toBe(60);
  });

  it("số từ cần học chọn từ cốt lõi xuất hiện nhiều nhất trước", () => {
    const words = [w("甲", 4, 3, "a"), w("乙", 4, 1, "b"), w("丙", 4, 1, "c"), w("我", 1, 5)];
    const items = [item("a", "甲"), item("b", "乙"), item("c", "丙")];
    const r = computeComprehension(words, items, { userLevel: 2, known: none })!;
    expect(r.percent).toBe(50);
    expect(r.wordsTo80).toBe(1); // học 甲 → 80%
    expect(r.toLearn).toBe(3);
    expect(r.percentIfAllLearned).toBe(100);
  });

  it("học hết từ cốt lõi vẫn chưa tới 80% thì wordsTo80 là null", () => {
    const words = [w("甲", 4, 1, "a"), w("很难", 6, 9)];
    const r = computeComprehension(words, [item("a", "甲")], { userLevel: 1, known: none })!;
    expect(r.wordsTo80).toBeNull();
    expect(r.percentIfAllLearned).toBe(10);
  });
});
