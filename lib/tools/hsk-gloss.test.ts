import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildHskGlossPrompt, parseHskGlosses, readingCandidates } from "./hsk-gloss";

const e = (pinyin: string, meanings: string[], simplified = "和"): DictWordRow => ({ simplified, traditional: simplified, pinyin, meanings, hsk_level: 1, frequency: null });

describe("readingCandidates", () => {
  it("bỏ mục họ người và biến thể, gộp mục trùng pinyin, giữ tối đa 4 cách", () => {
    const got = readingCandidates([e("Hé", ["surname He"]), e("hé", ["and"]), e("hé", ["old variant of 和[he2]"]), e("hè", ["to join in"]), e("hú", ["mahjong"]), e("huó", ["to mix"]), e("huò", ["to blend"])]);
    expect(got.map((c) => c.pinyin)).toEqual(["hé", "hè", "hú", "huó"]);
    expect(got[0].meanings).toEqual(["and"]);
  });
  it("chỉ có mục họ người thì vẫn giữ để có ứng viên", () => {
    expect(readingCandidates([e("Yě", ["surname Ye"], "也")]).map((c) => c.pinyin)).toEqual(["Yě"]);
  });
});

describe("parseHskGlosses", () => {
  const inputs = [{ term: "和", candidates: [{ pinyin: "hé", meanings: ["and"] }, { pinyin: "hú", meanings: ["mahjong"] }] }, { term: "好", candidates: [{ pinyin: "hǎo", meanings: ["good"] }] }];
  it("đổi số thứ tự cách đọc thành pinyin của từ điển", () => {
    const out = parseHskGlosses('{"items":{"和":{"reading":1,"gloss":"và, với"},"好":{"reading":"1","gloss":"tốt"}}}', inputs);
    expect(out.glosses).toEqual({ 和: { reading: "hé", gloss: "và, với" }, 好: { reading: "hǎo", gloss: "tốt" } });
    expect(out.missing).toEqual([]);
  });
  it("bỏ mục có số ngoài danh sách, nghĩa rỗng hoặc quá dài; chịu được hàng rào mã", () => {
    const out = parseHskGlosses('```json\n{"items":{"和":{"reading":5,"gloss":"và"},"好":{"reading":1,"gloss":"' + "x".repeat(81) + '"}}}\n```', inputs);
    expect(out.glosses).toEqual({});
    expect(out.missing).toEqual(["和", "好"]);
  });
  it("JSON hỏng thì thiếu hết", () => {
    expect(parseHskGlosses("không phải json", inputs).missing).toEqual(["和", "好"]);
  });
});

describe("buildHskGlossPrompt", () => {
  it("liệt kê các cách đọc ứng viên đánh số", () => {
    const p = buildHskGlossPrompt([{ term: "和", candidates: [{ pinyin: "hé", meanings: ["and", "with"] }, { pinyin: "hè", meanings: ["to join in"] }] }]);
    expect(p).toContain("和\n  1. hé | and; with\n  2. hè | to join in");
  });
});
