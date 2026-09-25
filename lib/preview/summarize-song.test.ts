import { describe, expect, it } from "vitest";
import type { PreviewItem } from "@/lib/analysis/analysis-types";
import type { LearnerState, SavedItem } from "@/lib/user-state/learner-state";
import { summarizeSong } from "./summarize-song";

const item = (term: string, level: number | null, type: PreviewItem["type"] = "vocab"): PreviewItem => ({
  id: `${type}:${term}`, type, term, level, meaningInContext: "x", occurrences: [], priority: 1,
});
const saved = (key: string, videoId: string): SavedItem => ({ key, videoId, type: "vocab", term: "x", lineIndex: 0, start: 0, savedAt: 1 });
const state = (over: Partial<LearnerState>): LearnerState => ({ level: 3, known: [], saved: [], ...over });

describe("summarizeSong", () => {
  const items = [item("a", 1), item("b", 3), item("c", 5), item("d", null), item("把", 4, "grammar")];

  it("hiểu = đã biết hoặc dưới level hiện tại; chỉ tính từ vựng", () => {
    const s = summarizeSong("v", items, state({ known: ["vocab:c"] }));
    expect(s).toMatchObject({ vocabTotal: 4, vocabUnderstood: 2, understoodPercent: 50 });
  });

  it("đếm thẻ đã lưu của đúng bài này và mục đã biết (gồm ngữ pháp)", () => {
    const s = summarizeSong("v", items, state({ known: ["vocab:c", "grammar:把"], saved: [saved("vocab:b", "v"), saved("vocab:z", "other")] }));
    expect(s.savedCount).toBe(1);
    expect(s.knownCount).toBe(2);
  });

  it("bài không có từ vựng: 0%, không chia cho 0", () => {
    expect(summarizeSong("v", [item("把", 4, "grammar")], state({})).understoodPercent).toBe(0);
  });
});
