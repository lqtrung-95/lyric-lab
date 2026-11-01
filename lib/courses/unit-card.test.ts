import { describe, expect, it } from "vitest";
import { cardsToAdd, unitCardItem } from "./unit-card";
import type { UnitWord } from "./unit-types";

const word = (term: string, withExample: boolean): UnitWord => ({
  term, pinyin: "x", sinoViet: null, hskLevel: 3, gloss: `nghĩa ${term}`, meanings: [],
  examples: withExample ? [{ videoId: "vid", lineIdx: 4, start: 12, end: 14, text: term, pinyin: "", translation: "", quality: 1 }] : [],
});
const words = [word("猫", true), word("狗", false), word("鱼", true)];

describe("thẻ ôn của chặng", () => {
  it("từ có câu thật lấy nguồn, từ không có vẫn có thẻ (videoId rỗng)", () => {
    expect(unitCardItem(words[0], 1)).toMatchObject({ key: "vocab:猫", videoId: "vid", lineIndex: 4, start: 12, meaning: "nghĩa 猫", savedAt: 1 });
    expect(unitCardItem(words[1], 1)).toMatchObject({ key: "vocab:狗", videoId: "", lineIndex: 0, start: 0 });
  });
  it("đạt thì thêm cả chặng, bỏ thẻ đã có", () => {
    expect(cardsToAdd(words, [], true, new Set(["vocab:猫"])).map((c) => c.term)).toEqual(["狗", "鱼"]);
  });
  it("chưa đạt thì chỉ thêm từ làm sai", () => {
    expect(cardsToAdd(words, ["狗"], false, new Set()).map((c) => c.term)).toEqual(["狗"]);
    expect(cardsToAdd(words, [], false, new Set())).toEqual([]);
  });
});
