import { describe, expect, it } from "vitest";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { computeComprehension } from "./comprehension";

const item = (id: string, term: string, level: number | null = 4): PreviewItem => ({
  id, type: "vocab", term, level, meaningInContext: "x", occurrences: [], priority: 1,
});
const tok = (text: string, itemId?: string) => ({ text, itemId });
const none = new Set<string>();

describe("computeComprehension", () => {
  it("null khi bài không có chữ Hán", () => {
    expect(computeComprehension([{ tokens: [tok("la"), tok(",")] }], [], { userLevel: 1, known: none })).toBeNull();
  });

  it("từ không nằm trong mục từ vựng được xem là hiểu", () => {
    const r = computeComprehension([{ tokens: [tok("我"), tok("你")] }], [], { userLevel: 1, known: none });
    expect(r).toEqual({ percent: 100, wordsTo80: 0, toLearn: 0 });
  });

  it("tính theo số lần xuất hiện và bỏ qua dấu câu", () => {
    const items = [item("a", "永远")];
    const lines = [{ tokens: [tok("永远", "a"), tok("，"), tok("我"), tok("你"), tok("他")] }, { tokens: [tok("永远", "a"), tok("好")] }];
    // 6 từ chữ Hán, 2 lần "永远" chưa hiểu → 4/6 ≈ 67%
    const r = computeComprehension(lines, items, { userLevel: 1, known: none })!;
    expect(r.percent).toBe(67);
    expect(r.toLearn).toBe(1);
    expect(r.wordsTo80).toBe(1);
  });

  it("từ đã biết hoặc thấp hơn level thì không tính là chưa hiểu", () => {
    const items = [item("a", "永远", 4), item("b", "好", 1)];
    const lines = [{ tokens: [tok("永远", "a"), tok("好", "b"), tok("我")] }];
    expect(computeComprehension(lines, items, { userLevel: 3, known: new Set(["vocab:永远"]) })!.percent).toBe(100);
    expect(computeComprehension(lines, items, { userLevel: 3, known: none })!.percent).toBe(67);
  });

  it("chọn từ xuất hiện nhiều nhất trước để chạm 80%", () => {
    const items = [item("a", "甲"), item("b", "乙"), item("c", "丙")];
    // 10 từ: 甲×3, 乙×1, 丙×1, 5 từ khác → 50%. Bỏ 甲 → 80%.
    const lines = [{ tokens: [tok("甲", "a"), tok("甲", "a"), tok("甲", "a"), tok("乙", "b"), tok("丙", "c"), tok("我"), tok("你"), tok("他"), tok("她"), tok("它")] }];
    const r = computeComprehension(lines, items, { userLevel: 1, known: none })!;
    expect(r.percent).toBe(50);
    expect(r.wordsTo80).toBe(1);
    expect(r.toLearn).toBe(3);
  });
});
