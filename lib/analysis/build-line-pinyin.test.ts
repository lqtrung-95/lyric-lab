import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildLinePinyin, pinyinForToken, subwordsOf, wordsMissingFrom } from "./build-line-pinyin";

const row = (simplified: string, pinyin: string): DictWordRow => ({ simplified, traditional: simplified, pinyin, meanings: ["x"], hsk_level: null, frequency: null } as DictWordRow);
const dict = new Map([
  ["准备", [row("准备", "zhǔn bèi")]],
  ["好了", [row("好了", "hǎo le")]],
  ["好", [row("好", "hǎo")]],
  ["了", [row("了", "le")]],
  ["吗", [row("吗", "má"), row("吗", "ma")]],
]);

describe("pinyinForToken", () => {
  it("có nguyên từ thì dùng pinyin của từ", () => {
    expect(pinyinForToken("准备", dict)).toBe("zhǔn bèi");
  });

  it("từ không có trong từ điển: ghép từ các đoạn con dài nhất, không để chữ Hán trong dòng pinyin", () => {
    expect(pinyinForToken("好了吗", dict)).toBe("hǎo le ma");
  });

  it("chữ nào cũng không tra được thì giữ nguyên chữ đó", () => {
    expect(pinyinForToken("好囧", dict)).toBe("hǎo 囧");
  });
});

describe("trợ từ", () => {
  it("ưu tiên âm nhẹ cho trợ từ cuối câu dù từ điển liệt kê âm có dấu trước", () => {
    expect(pinyinForToken("吗", dict)).toBe("ma");
  });
});

describe("buildLinePinyin", () => {
  it("ghép các token, giữ dấu câu và chữ Latin", () => {
    const tokens = [{ text: "准备", simplified: "准备" }, { text: "好了吗", simplified: "好了吗" }, { text: "OK", simplified: "OK" }, { text: "?", simplified: "?" }];
    expect(buildLinePinyin(tokens, dict)).toBe("zhǔn bèi hǎo le ma OK ?");
  });
});

describe("subwordsOf / wordsMissingFrom", () => {
  it("sinh các đoạn con 1–4 chữ, không trùng", () => {
    expect(subwordsOf("好了吗").sort()).toEqual(["了", "了吗", "吗", "好", "好了", "好了吗"].sort());
    expect(subwordsOf("啊啊")).toEqual(["啊", "啊啊"]);
  });

  it("chỉ báo từ có chữ Hán mà từ điển thiếu", () => {
    expect(wordsMissingFrom(["准备", "好了吗", "OK", "，"], dict)).toEqual(["好了吗"]);
  });
});
