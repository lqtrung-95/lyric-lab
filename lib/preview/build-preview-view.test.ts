import { describe, expect, it } from "vitest";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import { buildPreviewView } from "./build-preview-view";

const item = (term: string, level: number | null, priority = 50, type: "vocab" | "grammar" = "vocab"): PreviewItem => ({
  id: `${type}:${term}`, type, term, level, meaningInContext: "m", occurrences: [], priority,
});
const items = [item("城市", 3, 80), item("离开", 2, 90), item("回忆", 5, 70), item("新词", null, 60), item("从来没", 4, 75, "grammar")];
const base = { userLevel: 3, known: new Set<string>(), levelFilter: "all" as const, showEasy: false };

describe("buildPreviewView", () => {
  it("ẩn mục dưới level, đếm số mục ẩn, giữ mục ngoài HSK", () => {
    const v = buildPreviewView(items, base);
    expect(v.vocab.map((i) => i.term)).toEqual(["城市", "回忆", "新词"]);
    expect(v.grammar.map((i) => i.term)).toEqual(["从来没"]);
    expect(v.hiddenBelowLevel).toBe(1);
  });

  it("đổi level cập nhật ngay kết quả", () => {
    expect(buildPreviewView(items, { ...base, userLevel: 5 }).vocab.map((i) => i.term)).toEqual(["回忆", "新词"]);
    expect(buildPreviewView(items, { ...base, userLevel: 1 }).hiddenBelowLevel).toBe(0);
  });

  it("showEasy hiện cả mục dễ", () => {
    expect(buildPreviewView(items, { ...base, showEasy: true }).vocab).toHaveLength(4);
  });

  it("'Đã biết' ẩn mục và được đếm", () => {
    const v = buildPreviewView(items, { ...base, known: new Set(["vocab:城市"]) });
    expect(v.vocab.map((i) => i.term)).not.toContain("城市");
    expect(v.knownCount).toBe(1);
  });

  it("chip theo cấp có số lượng đúng; lọc theo cấp và 'Ngoài HSK'", () => {
    const v = buildPreviewView(items, base);
    expect(v.chips.map((c) => `${c.label}:${c.count}`)).toEqual(["Tất cả:4", "HSK 3:1", "HSK 4:1", "HSK 5:1", "Ngoài HSK:1"]);
    expect(buildPreviewView(items, { ...base, levelFilter: 5 }).vocab.map((i) => i.term)).toEqual(["回忆"]);
    expect(buildPreviewView(items, { ...base, levelFilter: "none" }).vocab.map((i) => i.term)).toEqual(["新词"]);
  });

  it("sắp theo priority giảm dần", () => {
    expect(buildPreviewView(items, { ...base, userLevel: 1 }).vocab.map((i) => i.term)).toEqual(["离开", "城市", "回忆", "新词"]);
  });
});
