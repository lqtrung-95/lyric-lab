import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { convertHanText, joinField, type ConvertDeps } from "./convert-han-text";

const row = (simplified: string, traditional: string, pinyin: string): DictWordRow => ({ simplified, traditional, pinyin, meanings: ["x"], hsk_level: 1, frequency: null } as DictWordRow);
const WORDS = [row("你好", "你好", "nǐ hǎo"), row("你", "你", "nǐ"), row("好", "好", "hǎo"), row("学生", "學生", "xué sheng"), row("学", "學", "xué"), row("生", "生", "shēng")];
const READINGS = new Map([["你", ["nhĩ"]], ["好", ["hảo"]], ["學", ["học"]], ["生", ["sinh"]]]);
const deps: ConvertDeps = {
  lookupWords: async (terms) => new Map(terms.flatMap((t) => { const r = WORDS.filter((w) => w.simplified === t); return r.length ? [[t, r] as const] : []; })),
  sinoVietReadings: async (chars) => new Map(chars.flatMap((c) => (READINGS.has(c) ? [[c, READINGS.get(c)!] as const] : []))),
};

describe("convertHanText", () => {
  it("cho pinyin từ từ điển và Hán Việt ghép theo chữ phồn thể của từ", async () => {
    const [line] = await convertHanText("你好", deps);
    expect(line.tokens).toEqual([{ text: "你好", pinyin: "nǐ hǎo", sinoViet: "nhĩ hảo" }]);
  });
  it("nhận chữ phồn thể, giữ nguyên chữ hiển thị nhưng tra theo giản thể", async () => {
    const [line] = await convertHanText("學生", deps);
    expect(line.tokens[0]).toEqual({ text: "學生", pinyin: "xué sheng", sinoViet: "học sinh" });
  });
  it("dấu câu và chữ Latin giữ nguyên, không có pinyin hay Hán Việt; mỗi dòng một mảng", async () => {
    const lines = await convertHanText("你好，ABC\n学生", deps);
    expect(lines).toHaveLength(2);
    expect(lines[0].tokens.filter((t) => t.pinyin === null).map((t) => t.text)).toEqual(["，", "ABC"]);
  });
  it("chữ không có trong bảng Hán Việt thì để trống, không đoán", async () => {
    const [line] = await convertHanText("你龘", deps);
    expect(line.tokens.find((t) => t.text === "龘")?.sinoViet).toBeNull();
    expect(line.tokens.find((t) => t.text === "你")?.sinoViet).toBe("nhĩ");
  });
  it("văn bản chỉ có chữ Latin thì không gọi tra từ điển", async () => {
    const [line] = await convertHanText("hello", { lookupWords: () => { throw new Error("không được gọi"); }, sinoVietReadings: () => { throw new Error("không được gọi"); } });
    expect(line.tokens).toEqual([{ text: "hello", pinyin: null, sinoViet: null }]);
  });
  it("joinField ghép theo dòng; token thiếu giá trị dùng chữ gốc", async () => {
    const lines = await convertHanText("你好，学生", deps);
    expect(joinField(lines, "pinyin")).toBe("nǐ hǎo ， xué sheng");
  });
});
