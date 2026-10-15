import { describe, expect, it } from "vitest";
import { TONE_PRACTICE } from "./tone-data";
import { buildToneQuiz } from "./tone-quiz";

describe("buildToneQuiz", () => {
  it("đủ số câu, không lặp chữ, thanh rải đều", () => {
    const q = buildToneQuiz(8);
    expect(q).toHaveLength(8);
    expect(new Set(q.map((x) => x.han)).size).toBe(8);
    for (const t of [1, 2, 3, 4]) expect(q.filter((x) => x.answer === t)).toHaveLength(2);
  });
  it("đáp án khớp thanh của chữ trong dữ liệu", () => {
    for (const x of buildToneQuiz(16)) expect(TONE_PRACTICE[x.answer].some((p) => p.han === x.han)).toBe(true);
  });
  it("không vượt quá số chữ có sẵn", () => {
    expect(buildToneQuiz(100)).toHaveLength(16);
  });
});
