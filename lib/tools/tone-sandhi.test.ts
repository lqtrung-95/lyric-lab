import { describe, expect, it } from "vitest";
import { applySandhi, charsFromConverted, parseSyllable } from "./tone-sandhi";

const seq = (pairs: [string, string | null][]) => applySandhi(pairs.map(([ch, py]) => ({ ch, py })));
const spoken = (r: ReturnType<typeof seq>) => r.map((s) => s.spoken);

describe("parseSyllable", () => {
  it("tách âm gốc và thanh, giữ ü", () => {
    expect(parseSyllable("nǐ")).toEqual({ base: "ni", tone: 3 });
    expect(parseSyllable("lǜ")).toEqual({ base: "lü", tone: 4 });
    expect(parseSyllable("ma")).toEqual({ base: "ma", tone: 5 });
  });
});

describe("applySandhi", () => {
  it("hai thanh 3: 你好 → ní hǎo; ba thanh 3: 我很好 → wó hén hǎo", () => {
    expect(spoken(seq([["你", "nǐ"], ["好", "hǎo"]]))).toEqual(["ní", "hǎo"]);
    expect(spoken(seq([["我", "wǒ"], ["很", "hěn"], ["好", "hǎo"]]))).toEqual(["wó", "hén", "hǎo"]);
  });

  it("不: bú trước thanh 4, giữ nguyên trước thanh khác", () => {
    expect(spoken(seq([["不", "bù"], ["是", "shì"]]))).toEqual(["bú", "shì"]);
    expect(spoken(seq([["不", "bù"], ["好", "hǎo"]]))).toEqual(["bù", "hǎo"]);
  });

  it("一: yí trước thanh 4, yì trước thanh 1/2/3, giữ yī khi là số thứ tự hoặc đứng cuối", () => {
    expect(spoken(seq([["一", "yī"], ["个", "gè"]]))).toEqual(["yí", "gè"]);
    expect(spoken(seq([["一", "yī"], ["天", "tiān"]]))).toEqual(["yì", "tiān"]);
    expect(spoken(seq([["一", "yī"], ["起", "qǐ"]]))).toEqual(["yì", "qǐ"]);
    expect(spoken(seq([["第", "dì"], ["一", "yī"]]))).toEqual(["dì", "yī"]);
    expect(spoken(seq([["第", "dì"], ["一", "yī"], ["天", "tiān"]]))).toEqual(["dì", "yī", "tiān"]);
  });

  it("一 giữa hai động từ giống nhau đọc nhẹ", () => {
    expect(spoken(seq([["看", "kàn"], ["一", "yī"], ["看", "kàn"]]))).toEqual(["kàn", "yi", "kàn"]);
  });

  it("dấu câu ngắt mạch và không có pinyin", () => {
    const r = seq([["你", "nǐ"], ["，", null], ["好", "hǎo"]]);
    expect(spoken(r)).toEqual(["nǐ", null, "hǎo"]);
    expect(r.every((s) => !s.rule)).toBe(true);
  });
});

describe("charsFromConverted", () => {
  it("căn pinyin từng chữ từ token, token không có pinyin thì để null", () => {
    const r = charsFromConverted([{ tokens: [{ text: "你好", pinyin: "nǐ hǎo", sinoViet: null }, { text: "!", pinyin: null, sinoViet: null }] }]);
    expect(r[0].map((c) => c.py)).toEqual(["nǐ", "hǎo", null]);
  });
});
