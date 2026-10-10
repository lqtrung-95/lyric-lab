import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { averageLessonLevel, prepareLessonLines, termsToLookUp, toLessonLines } from "./build-lesson-lines";

const entry = (simplified: string, pinyin: string, hsk: number | null): DictWordRow => ({ simplified, traditional: simplified, pinyin, meanings: ["x"], hsk_level: hsk, frequency: null });
const dictionary = new Map<string, DictWordRow[]>([
  ["你好", [entry("你好", "nǐ hǎo", 1)]],
  ["朋友", [entry("朋友", "péng you", 1)]],
  ["今天", [entry("今天", "jīn tiān", 2)]],
]);
// Hội thoại hư cấu cho test.
const zh = [
  { text: "你好", start: 0, end: 2 },
  { text: "[音乐]", start: 2, end: 3 },
  { text: "今天，朋友", start: 3, end: 6 },
];

describe("prepareLessonLines", () => {
  it("bỏ dòng chú thích âm thanh, chia từ; bản dịch chưa có (do AI điền ở bước sau)", () => {
    const lines = prepareLessonLines(zh);
    expect(lines.map((l) => l.text)).toEqual(["你好", "今天，朋友"]);
    expect(lines.every((l) => l.translation === null)).toBe(true);
    expect(lines[1].tokens.filter((t) => t.isHan).map((t) => t.simplified)).toEqual(["今天", "朋友"]);
  });
});

describe("toLessonLines", () => {
  it("dựng pinyin theo từng từ, giữ thời gian, bản dịch (nếu đã điền) và token", () => {
    const prepared = prepareLessonLines(zh).map((l, i) => ({ ...l, translation: i === 0 ? "Xin chào" : null }));
    const out = toLessonLines(prepared, dictionary);
    expect(out[0]).toMatchObject({ idx: 0, start: 0, end: 2, text: "你好", pinyin: "nǐ hǎo", translation: "Xin chào" });
    expect(out[1].pinyin).toContain("jīn tiān");
    expect(out[1].tokens.map((t) => t.text)).toContain("朋友");
  });
});

describe("termsToLookUp / averageLessonLevel", () => {
  it("liệt kê từ chữ Hán không trùng và tính level trung bình theo lần xuất hiện", () => {
    const lines = prepareLessonLines(zh);
    expect(new Set(termsToLookUp(lines))).toEqual(new Set(["你好", "今天", "朋友"]));
    expect(averageLessonLevel(lines, dictionary)).toBe(1.3); // (1 + 2 + 1) / 3
  });
  it("không từ nào có cấp thì null", () => {
    expect(averageLessonLevel(prepareLessonLines(zh), new Map())).toBeNull();
  });
});
