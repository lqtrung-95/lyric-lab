import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { measureWordsFor, normalizeMeasureQuery } from "./find-measure-words";

const row = (over: Partial<DictWordRow>): DictWordRow => ({ simplified: "书", traditional: "書", pinyin: "shū", meanings: ["book", "CL:本[ben3],冊|册[ce4]"], hsk_level: 1, frequency: null, ...over });

describe("measureWordsFor", () => {
  it("lấy lượng từ từ dòng CL: của từ điển, kèm pinyin có dấu", () => {
    const r = measureWordsFor("书", [row({})]);
    expect(r?.classifiers).toEqual([{ text: "本", pinyin: "běn" }, { text: "册", pinyin: "cè" }]);
    expect(r?.meaning).toBe("book");
  });
  it("từ không ghi lượng từ thì danh sách rỗng; không có mục nào thì null", () => {
    expect(measureWordsFor("你", [row({ simplified: "你", meanings: ["you"] })])?.classifiers).toEqual([]);
    expect(measureWordsFor("无", [])).toBeNull();
  });
});

describe("normalizeMeasureQuery", () => {
  it("chỉ giữ chữ Hán, đổi phồn thể về giản thể và cắt độ dài", () => {
    expect(normalizeMeasureQuery(" 書 ")).toBe("书");
    expect(normalizeMeasureQuery("abc")).toBe("");
    expect([...normalizeMeasureQuery("你好".repeat(20))].length).toBe(12);
  });
});
