import { describe, expect, it } from "vitest";
import { buildPairQuiz, pairLabel, TONE_PAIRS, tonesOfPinyin } from "./tone-pairs";

describe("TONE_PAIRS", () => {
  it("đủ 20 cặp khác nhau (4 thanh đầu × 5 thanh sau), mỗi từ có chữ Hán và nghĩa", () => {
    expect(TONE_PAIRS).toHaveLength(20);
    expect(new Set(TONE_PAIRS.map(pairLabel)).size).toBe(20);
    expect(new Set(TONE_PAIRS.map((p) => p.han)).size).toBe(20);
    for (const p of TONE_PAIRS) { expect(p.han).toMatch(/^\p{Script=Han}{2}$/u); expect(p.vi.length).toBeGreaterThanOrEqual(2); }
  });
  it("thanh trong pinyin khớp đúng cặp khai báo (thanh nhẹ là 5)", () => {
    for (const p of TONE_PAIRS) expect(tonesOfPinyin(p.pinyin), `${p.han} ${p.pinyin}`).toEqual([p.first, p.second]);
  });
  it("các cặp có đổi thanh hoặc thanh nhẹ đều có ghi chú", () => {
    for (const p of TONE_PAIRS.filter((x) => x.second === 5 || x.first === 3)) expect(p.note, p.han).toBeTruthy();
  });
});

describe("tonesOfPinyin", () => {
  it("đọc dấu thanh", () => {
    expect(tonesOfPinyin("nǐ hǎo")).toEqual([3, 3]);
    expect(tonesOfPinyin("māma")).toEqual([1, 5]);
    expect(tonesOfPinyin("ma")).toBeNull();
  });
});

describe("buildPairQuiz", () => {
  it("không lặp từ, mỗi câu có 4 đáp án khác nhau chứa đáp án đúng", () => {
    const quiz = buildPairQuiz(8, () => 0.37);
    expect(quiz).toHaveLength(8);
    expect(new Set(quiz.map((q) => q.pair.han)).size).toBe(8);
    for (const q of quiz) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(pairLabel(q.pair));
    }
  });
  it("giới hạn theo số cặp có thật", () => { expect(buildPairQuiz(99)).toHaveLength(20); });
});
