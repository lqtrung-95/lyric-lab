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

  it("chữ nhiều âm: lấy hết mọi form (không chỉ form đầu), mỗi form một cách đọc riêng", () => {
    const w = {
      simplified: "都", level: ["new-1"], frequency: 25,
      forms: [
        { traditional: "都", transcriptions: { pinyin: "Dū" }, meanings: ["surname Du"] },
        { traditional: "都", transcriptions: { pinyin: "dōu" }, meanings: ["all; both; entirely"] },
        { traditional: "都", transcriptions: { pinyin: "dū" }, meanings: ["capital city"] },
      ],
    };
    const out = parseHskVocabulary([w]);
    expect(out.map((o) => o.pinyin)).toEqual(["Dū", "dōu", "dū"]);
    expect(out.every((o) => o.level === 1)).toBe(true);
  });
});
