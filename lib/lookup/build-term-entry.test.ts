import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildTermEntry } from "./build-term-entry";

const row = (over: Partial<DictWordRow>): DictWordRow => ({
  simplified: "城市", traditional: "城市", pinyin: "chéng shì", meanings: ["city", "town", "CL:座", "a", "b"], hsk_level: 3, frequency: null, ...over,
});
const table = new Map([["城", ["thành"]], ["市", ["thị"]]]);

describe("buildTermEntry", () => {
  it("ghép pinyin, Hán Việt, cấp và tối đa 4 nghĩa", () => {
    expect(buildTermEntry([row({})], table)).toEqual({
      term: "城市", traditional: "城市", pinyin: "chéng shì", sinoViet: "thành thị", hskLevel: 3, meanings: ["city", "town", "CL:座", "a"],
    });
  });
  it("thiếu chữ Hán Việt → null, không đoán; không có mục → null", () => {
    expect(buildTermEntry([row({ traditional: "城堡" })], table)?.sinoViet).toBeNull();
    expect(buildTermEntry([], table)).toBeNull();
  });
});
