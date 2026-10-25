import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { rankCompounds } from "./rank-compounds";

const r = (simplified: string, pinyin: string, hsk: number | null, frequency: number | null, meanings = ["m"]): DictWordRow =>
  ({ simplified, traditional: simplified, pinyin, meanings, hsk_level: hsk, frequency });

describe("rankCompounds", () => {
  it("bỏ chính từ đó và dòng không chứa từ, mỗi từ một dòng", () => {
    const out = rankCompounds([r("爱", "ài", 1, 130), r("爱情", "ài qíng", 2, 1164), r("爱情", "ài qíng", 2, 1164), r("可乐", "kě lè", 3, 900)], "爱", 10);
    expect(out.map((c) => c.simplified)).toEqual(["爱情"]);
  });
  it("phổ biến trước (HSK thấp), cùng độ phổ biến thì từ ngắn trước, tên riêng xuống cuối", () => {
    const out = rankCompounds([
      r("爱心", "ài xīn", 3, 2000), r("可爱", "kě ài", 2, 799), r("爱迪生", "Ài dí shēng", null, null), r("爱好者", "ài hào zhě", null, null), r("爱好", "ài hào", 1, 400),
    ], "爱", 10);
    expect(out.map((c) => c.simplified)).toEqual(["爱好", "可爱", "爱心", "爱好者", "爱迪生"]);
  });
  it("với từ nhiều âm, ưu tiên mục không phải họ người", () => {
    const out = rankCompounds([r("爱丽", "Ài Lì", null, null, ["surname"]), r("爱丽", "ài lì", null, null, ["pretty"])], "爱", 5);
    expect(out[0]).toMatchObject({ pinyin: "ài lì", meaning: "pretty" });
  });
  it("cắt theo limit", () => {
    expect(rankCompounds([r("爱a", "a", 1, 1), r("爱b", "b", 1, 2), r("爱c", "c", 1, 3)], "爱", 2)).toHaveLength(2);
  });
});
