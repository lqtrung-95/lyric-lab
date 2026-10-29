import { describe, expect, it } from "vitest";
import { READINGS } from "./reading-catalog";
import { allSentences } from "./reading-types";

describe("READINGS", () => {
  it("id duy nhất, có câu và câu hỏi hợp lệ", () => {
    expect(new Set(READINGS.map((r) => r.id)).size).toBe(READINGS.length);
    for (const r of READINGS) {
      expect(allSentences(r).length).toBeGreaterThanOrEqual(6);
      for (const s of allSentences(r)) { expect(/\p{Script=Han}/u.test(s.zh)).toBe(true); expect(s.vi.length).toBeGreaterThan(5); }
      expect(r.quiz.length).toBeGreaterThanOrEqual(2);
      for (const q of r.quiz) { expect(new Set(q.options).size).toBe(3); expect([0, 1, 2]).toContain(q.answer); }
    }
  });
});
