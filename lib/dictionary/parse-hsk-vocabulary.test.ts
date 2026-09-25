import { describe, expect, it } from "vitest";
import { parseHskVocabulary } from "./parse-hsk-vocabulary";

const raw = (simplified: string, level: string[]) => ({
  simplified, level, frequency: 100,
  forms: [{ traditional: simplified, transcriptions: { pinyin: "chéng shì" }, meanings: ["city"] }],
});

describe("parseHskVocabulary", () => {
  it("lấy cấp HSK 3.0 thấp nhất, bỏ bộ old-/newest-", () => {
    const out = parseHskVocabulary([raw("城市", ["new-3", "old-3"]), raw("回忆", ["new-5", "new-7"])]);
    expect(out.map((w) => [w.simplified, w.level])).toEqual([["城市", 3], ["回忆", 5]]);
  });

  it("bỏ từ không thuộc HSK 3.0", () => {
    expect(parseHskVocabulary([raw("旧词", ["old-2"]), raw("新词", ["newest-4"])])).toEqual([]);
  });

  it("new-7 là cấp 7 (nhóm 7–9)", () => {
    expect(parseHskVocabulary([raw("阿拉伯语", ["new-7"])])[0].level).toBe(7);
  });
});
