import { describe, expect, it } from "vitest";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import type { VocabCandidate } from "./analysis-types";
import type { LlmOutput } from "./llm-output-schema";
import { tokenizeLyricLines } from "./tokenize-lyric-lines";
import { patternMatchesLine, validateLlmOutput } from "./validate-llm-output";

// Lời hư cấu 夜车 (docs/design-brief.md mục 6).
const lines = tokenizeLyricLines(normalizeLyricLines([
  { text: "窗外的城市慢慢睡了", start: 0, end: 5 },
  { text: "我从来没想过会离开", start: 5, end: 10 },
  { text: "你的笑比星光还亮", start: 10, end: 15 },
]));
const cand = (term: string, lineIndex: number): VocabCandidate => ({
  term, traditional: term, pinyin: "p", hskLevel: 3, meanings: ["m"], occurrences: [{ lineIndex, start: lineIndex * 5 }],
});
const candidates = [cand("城市", 0), cand("离开", 1)];
const base: LlmOutput = { summary: "s", moods: ["m"], vocab: [], grammar: [], translations: [] };

describe("patternMatchesLine", () => {
  it.each([
    ["从来没 + V + 过", "我从来没想过会离开", true],
    ["A 比 B 还 + adj", "你的笑比星光还亮", true],
    ["就算 … 也 …", "我从来没想过会离开", false],
    ["V + O", "我从来没想过会离开", false],
    ["过 + 从来没", "我从来没想过会离开", false],
  ])("%s trong %s → %s", (pattern, line, expected) => {
    expect(patternMatchesLine(pattern, line)).toBe(expected);
  });
});

describe("validateLlmOutput", () => {
  it("loại từ không thuộc ứng viên và từ trùng, giữ vị trí từ ứng viên", () => {
    const v = validateLlmOutput({ ...base, vocab: [
      { term: "城市", meaningInContext: "thành phố", priority: 80 },
      { term: "星辰", meaningInContext: "bịa", priority: 50 },
      { term: "城市", meaningInContext: "lặp", priority: 10 },
    ] }, lines, candidates);
    expect(v.vocab.map((x) => x.candidate.term)).toEqual(["城市"]);
    expect(v.vocab[0].candidate.occurrences[0].lineIndex).toBe(0);
    expect(v.dropped.map((d) => d.reason)).toEqual(["không có trong danh sách ứng viên", "trùng"]);
  });

  it("ngữ pháp: chỉ giữ dòng khớp, loại mục không khớp dòng nào", () => {
    const v = validateLlmOutput({ ...base, grammar: [
      { pattern: "从来没 + V + 过", explanation: "e", example: { zh: "z", vi: "v" }, lineIndexes: [0, 1, 99], priority: 70 },
      { pattern: "就算 … 也 …", explanation: "e", example: { zh: "z", vi: "v" }, lineIndexes: [1], priority: 60 },
    ] }, lines, candidates);
    expect(v.grammar).toHaveLength(1);
    expect(v.grammar[0].occurrences).toEqual([{ lineIndex: 1, start: 5 }]);
    expect(v.dropped[0]).toMatchObject({ kind: "grammar", ref: "就算 … 也 …" });
  });

  it("bản dịch chỉ nhận cho dòng có thật", () => {
    const v = validateLlmOutput({ ...base, translations: [{ lineIndex: 0, vi: "a" }, { lineIndex: 42, vi: "b" }] }, lines, candidates);
    expect([...v.translations.keys()]).toEqual([0]);
  });
});
