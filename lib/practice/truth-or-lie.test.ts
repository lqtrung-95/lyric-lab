import { describe, expect, it } from "vitest";
import { splitForTts } from "@/lib/speech/split-for-tts";
import { buildTrial, pickRounds } from "./truth-or-lie";
import { TRUTH_ROUNDS } from "./truth-or-lie-data";

describe("kho Hai thật một giả", () => {
  it("đủ số vòng, mỗi vòng có đúng hai câu thật và một câu sai, giải thích bằng tiếng Việt", () => {
    expect(TRUTH_ROUNDS.length).toBeGreaterThanOrEqual(20);
    for (const r of TRUTH_ROUNDS) {
      expect(r.truths).toHaveLength(2);
      expect(r.explain.length, r.topic).toBeGreaterThan(10);
      for (const s of [...r.truths, r.lie]) { expect(s.zh, s.vi).toMatch(/\p{Script=Han}/u); expect(s.vi.length).toBeGreaterThan(0); }
    }
  });

  it("không trùng câu nào, mọi câu đọc được bằng giọng tạo sẵn (≤ 40 ký tự)", () => {
    const all = TRUTH_ROUNDS.flatMap((r) => [...r.truths, r.lie].map((s) => s.zh));
    expect(new Set(all).size).toBe(all.length);
    for (const zh of all) for (const part of splitForTts(zh)) expect(part.length, zh).toBeLessThanOrEqual(40);
  });

  it("chọn các vòng khác nhau và dựng lượt chơi với đúng một câu sai", () => {
    const rounds = pickRounds(8, () => 0.3);
    expect(new Set(rounds.map((r) => r.topic)).size).toBe(8);
    for (const r of TRUTH_ROUNDS) {
      for (const seed of [0, 0.4, 0.99]) {
        const trial = buildTrial(r, () => seed);
        expect(trial.options).toHaveLength(3);
        expect(trial.options.filter((o) => o.lie)).toHaveLength(1);
        expect(trial.options[trial.lieIndex].zh).toBe(r.lie.zh);
      }
    }
  });
});
