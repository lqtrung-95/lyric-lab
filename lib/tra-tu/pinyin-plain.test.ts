import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { BASE, TONED, hasPinyinTone, plainPinyin, plainPinyinQuery, pinyinRegexFallback, toneKey } from "./pinyin-plain";

describe("plainPinyin", () => {
  it("bỏ dấu thanh và khoảng trắng: 'xǐ huan' → xihuan", () => {
    expect(plainPinyin("xǐ huan")).toBe("xihuan");
    expect(plainPinyin("Dū")).toBe("du");
  });
  it("ü thành v ở mọi dạng người dùng hay gõ", () => {
    expect(plainPinyin("nǚ")).toBe("nv");
    expect(plainPinyinQuery("nü")).toBe("nv");
    expect(plainPinyinQuery("lu:e4")).toBe("lve");
    expect(plainPinyinQuery("lv")).toBe("lv");
  });
  it("số thanh không lọt vào dạng phẳng", () => {
    expect(plainPinyinQuery("ni3hao3")).toBe("nihao");
  });
});

describe("toneKey / hasPinyinTone", () => {
  it("giữ dấu thanh nhưng bỏ khoảng trắng", () => {
    expect(toneKey("Nǐ Hǎo")).toBe("nǐhǎo");
  });
  it("nhận ra dấu thanh và số thanh", () => {
    expect(hasPinyinTone("mā")).toBe(true);
    expect(hasPinyinTone("ma1")).toBe(true);
    expect(hasPinyinTone("ma")).toBe(false);
  });
});

describe("pinyinRegexFallback", () => {
  it("khớp có dấu và có/không khoảng trắng giữa các chữ cái", () => {
    const re = new RegExp(pinyinRegexFallback("xihuan"), "i");
    expect(re.test("xǐ huan")).toBe(true);
    expect(re.test("xǐhuan")).toBe(true);
    expect(re.test("xīnhuān")).toBe(false);
  });
  it("v khớp ü", () => {
    expect(new RegExp(pinyinRegexFallback("nv"), "i").test("nǚ")).toBe(true);
  });
});

describe("migration dict_search_columns", () => {
  it("hàm SQL dict_pinyin_plain dùng đúng bảng đổi ký tự của plainPinyin", () => {
    const sql = readFileSync("supabase/migrations/20261026000010_dict_search_columns.sql", "utf8");
    expect(sql).toContain(`'${TONED}', '${BASE}'`);
  });
});
