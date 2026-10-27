import { describe, expect, it } from "vitest";
import type { WordResult } from "@/lib/tra-tu/types";
import { filterByTone, normalizePinyinQuery, toPinyinResults } from "./pinyin-to-han";

const word = (simplified: string, match: WordResult["match"], pinyin = "x"): WordResult => ({
  simplified, traditional: simplified, readings: [{ pinyin, meanings: ["a", "b", "c"], hskLevel: 1, frequency: 1 }], sinoViet: null, gloss: null, hskLevel: 1, match, score: 1,
});

describe("normalizePinyinQuery", () => {
  it("nhận pinyin có dấu, số thanh, cách và dấu nháy", () => {
    expect(normalizePinyinQuery("  nǐ   hǎo ")).toBe("nǐ hǎo");
    expect(normalizePinyinQuery("ni3hao3")).toBe("ni3hao3");
    expect(normalizePinyinQuery("xi'an")).toBe("xi'an");
    expect(normalizePinyinQuery("nǚ")).toBe("nǚ");
  });
  it("từ chối rỗng, chữ Hán, ký tự lạ hoặc không có chữ cái", () => {
    expect(normalizePinyinQuery("   ")).toBeNull();
    expect(normalizePinyinQuery("你好")).toBeNull();
    expect(normalizePinyinQuery("ni hao!")).toBeNull();
    expect(normalizePinyinQuery("123")).toBeNull();
  });
});

describe("toPinyinResults", () => {
  it("chỉ giữ kết quả khớp theo pinyin, giữ thứ tự và rút nghĩa còn hai", () => {
    const r = toPinyinResults([word("你好", "pinyin", "nǐ hǎo"), word("好", "english"), word("尼", "pinyin", "ní")]);
    expect(r.map((x) => x.han)).toEqual(["你好", "尼"]);
    expect(r[0].meaning).toBe("a; b");
    expect(r[0].pinyin).toBe("nǐ hǎo");
  });
  it("giới hạn số kết quả", () => {
    expect(toPinyinResults(Array.from({ length: 40 }, (_, i) => word(`字${i}`, "pinyin")), 5)).toHaveLength(5);
  });
});

describe("filterByTone", () => {
  const r = toPinyinResults([word("是", "pinyin", "shì"), word("十", "pinyin", "shí"), word("事业", "pinyin", "shì yè"), word("师", "pinyin", "shī")]);
  it("không gõ thanh thì giữ nguyên", () => {
    expect(filterByTone("shi", r)).toEqual({ results: r, relaxed: false });
  });
  it("gõ số thanh hoặc dấu thì chỉ giữ đúng thanh (so tiền tố)", () => {
    expect(filterByTone("shi4", r).results.map((x) => x.han)).toEqual(["是", "事业"]);
    expect(filterByTone("shí", r).results.map((x) => x.han)).toEqual(["十"]);
  });
  it("không có từ đúng thanh thì giữ danh sách cùng âm và báo relaxed", () => {
    expect(filterByTone("shi5", r)).toEqual({ results: r, relaxed: true });
  });
  it("hiểu cả cụm nhiều âm tiết viết liền", () => {
    const hello = toPinyinResults([word("你好", "pinyin", "nǐ hǎo"), word("尼好", "pinyin", "ní hǎo")]);
    expect(filterByTone("ni3hao3", hello).results.map((x) => x.han)).toEqual(["你好"]);
  });
});
