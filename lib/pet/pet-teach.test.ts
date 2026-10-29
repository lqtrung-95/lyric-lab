import { describe, expect, it } from "vitest";
import type { SavedItem } from "@/lib/user-state/learner-state";
import { applyTeach, candidatesFromSaved, forgottenWords, isForgotten, nextTeachQuestion, parseTaught, type TaughtWord, type TeachCandidate } from "./pet-teach";

const DAY = 86_400_000;
const POOL: TeachCandidate[] = [
  { term: "苹果", pinyin: "píngguǒ", meaning: "quả táo" },
  { term: "牛奶", pinyin: "niúnǎi", meaning: "sữa bò" },
  { term: "面包", pinyin: "miànbāo", meaning: "bánh mì" },
  { term: "米饭", pinyin: "mǐfàn", meaning: "cơm" },
];
const taughtAt = (term: string, lastAt: number, level = 1): TaughtWord => ({ term, pinyin: null, meaning: "x", taughtAt: lastAt, lastAt, level });

describe("candidatesFromSaved", () => {
  const item = (o: Partial<SavedItem>): SavedItem => ({ key: "k", videoId: "", type: "vocab", term: "你好", lineIndex: 0, start: 0, savedAt: 0, meaning: "xin chào", reading: "nǐ hǎo", ...o });
  it("giữ từ vựng có nghĩa, bỏ ngữ pháp, thiếu nghĩa và trùng", () => {
    const out = candidatesFromSaved([item({}), item({ type: "grammar", term: "把" }), item({ term: "谢谢", meaning: "" }), item({})]);
    expect(out).toEqual([{ term: "你好", pinyin: "nǐ hǎo", meaning: "xin chào" }]);
  });
});

describe("quên và dạy lại", () => {
  it("mức 1 nhớ 3 ngày, mức 3 nhớ 14 ngày", () => {
    expect(isForgotten(taughtAt("a", 0, 1), 3 * DAY)).toBe(false);
    expect(isForgotten(taughtAt("a", 0, 1), 3 * DAY + 1)).toBe(true);
    expect(isForgotten(taughtAt("a", 0, 3), 10 * DAY)).toBe(false);
    expect(forgottenWords([taughtAt("a", 0, 1), taughtAt("b", 9 * DAY, 1)], 10 * DAY).map((w) => w.term)).toEqual(["a"]);
  });
  it("từ mới vào mức 1; dạy lại khi còn nhớ lên mức; quên rồi thì giữ mức", () => {
    const first = applyTeach([], POOL[0], 0);
    expect(first[0].level).toBe(1);
    expect(applyTeach(first, POOL[0], DAY)[0].level).toBe(2);
    expect(applyTeach(first, POOL[0], 10 * DAY)[0].level).toBe(1);
    expect(applyTeach(applyTeach(applyTeach(first, POOL[0], DAY), POOL[0], 2 * DAY), POOL[0], 3 * DAY)[0].level).toBe(3);
  });
});

describe("nextTeachQuestion", () => {
  it("cần ít nhất 3 nghĩa khác nhau", () => {
    expect(nextTeachQuestion(POOL.slice(0, 2), [], new Set(), 0, 1)).toBeNull();
  });
  it("đáp án đúng nằm trong 3 lựa chọn khác nhau", () => {
    const q = nextTeachQuestion(POOL, [], new Set(), 0, 5)!;
    expect(q.options).toHaveLength(3);
    expect(new Set(q.options).size).toBe(3);
    expect(q.options[q.answer]).toBe(q.word.meaning);
  });
  it("ưu tiên từ đã quên, rồi từ chưa dạy, và bỏ từ đã hỏi", () => {
    const taught = [taughtAt("苹果", 0, 1), taughtAt("牛奶", 20 * DAY, 1), taughtAt("面包", 20 * DAY, 1)];
    expect(nextTeachQuestion(POOL, taught, new Set(), 20 * DAY, 9)!.word.term).toBe("苹果");
    expect(nextTeachQuestion(POOL, taught, new Set(["苹果"]), 20 * DAY, 9)!.word.term).toBe("米饭");
    expect(nextTeachQuestion(POOL, [], new Set(POOL.map((p) => p.term)), 0, 1)).toBeNull();
  });
  it("cùng hạt giống thì cùng câu hỏi", () => {
    expect(nextTeachQuestion(POOL, [], new Set(), 0, 42)).toEqual(nextTeachQuestion(POOL, [], new Set(), 0, 42));
  });
});

describe("parseTaught", () => {
  it("bỏ mục sai dạng và kẹp mức trong 1..3", () => {
    const out = parseTaught([{ term: "a", meaning: "b", taughtAt: 1, lastAt: 2, level: 9 }, { term: "", meaning: "b", taughtAt: 1, lastAt: 2, level: 1 }, null, "x"]);
    expect(out).toHaveLength(1);
    expect(out[0].level).toBe(3);
    expect(parseTaught("oops")).toEqual([]);
  });
});
