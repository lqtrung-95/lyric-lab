import { describe, expect, it } from "vitest";
import { savedItemForWord } from "./saved-item";
import type { SceneWord } from "./explore-types";

const word: SceneWord = {
  id: "cup", term: "杯子", gloss: "cái cốc", example: { zh: "这个杯子很漂亮。", vi: "Cái cốc này rất đẹp." }, x: 1, y: 1, w: 1,
  pinyin: "bēi zi", sinoViet: "bôi", hskLevel: 1,
  examples: [{ videoId: "abcdefghijk", lineIdx: 12, start: 34.5, end: 37, text: "我喜欢这个杯子", pinyin: "wǒ xǐhuan zhège bēizi", translation: "Tôi thích cái cốc này", quality: 3 }],
};

describe("savedItemForWord", () => {
  it("tạo thẻ vocab từ câu thật đầu tiên, kèm pinyin, Hán Việt, cấp HSK và nghĩa Việt", () => {
    expect(savedItemForWord(word, 1000)).toEqual({
      key: "vocab:杯子", videoId: "abcdefghijk", type: "vocab", term: "杯子", lineIndex: 12, start: 34.5, savedAt: 1000,
      reading: "bēi zi", sinoViet: "bôi", level: 1, meaning: "cái cốc",
    });
  });
  it("chưa có câu thật thì không tạo được thẻ", () => {
    expect(savedItemForWord({ ...word, examples: [] })).toBeNull();
  });
  it("không có Hán Việt thì bỏ trường đó", () => {
    expect(savedItemForWord({ ...word, sinoViet: null })?.sinoViet).toBeUndefined();
  });
});
