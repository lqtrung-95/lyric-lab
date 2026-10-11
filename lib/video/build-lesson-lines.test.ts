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
  it("liệt kê từ chữ Hán không trùng; ít từ quá thì chưa đánh giá level (null)", () => {
    const lines = prepareLessonLines(zh);
    expect(new Set(termsToLookUp(lines))).toEqual(new Set(["你好", "今天", "朋友"]));
    expect(averageLessonLevel(lines, dictionary)).toBeNull(); // dưới 20 lượt từ
  });
  it("đủ từ thì quy ra thang HSK theo tỉ lệ từ HSK 1–3; từ ngoài từ điển tính là khó", () => {
    // Dựng thẳng các dòng đã chuẩn bị (30 dòng, mỗi dòng 3 từ) để không bị bước làm sạch gộp các dòng giống nhau.
    const word = (text: string) => ({ text, simplified: text, isHan: true });
    const prepared = Array.from({ length: 30 }, (_, i) => ({
      text: "你好朋友今天", start: i * 2, end: i * 2 + 2, tokens: [word("你好"), word("朋友"), word("今天")], translation: null,
    })) as unknown as Parameters<typeof averageLessonLevel>[0];
    const easy = averageLessonLevel(prepared, dictionary)!;
    const hard = averageLessonLevel(prepared, new Map())!;
    expect(easy).toBeLessThan(2);
    expect(hard).toBeGreaterThan(easy + 3);
  });
});
