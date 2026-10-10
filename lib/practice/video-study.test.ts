import { describe, expect, it } from "vitest";
import { validateVideoStudy } from "./video-study";

describe("validateVideoStudy", () => {
  it("nhận hai chế độ video với số câu hợp lý", () => {
    expect(validateVideoStudy({ mode: "dictation", lines: 1, correct: 1 })).toEqual({ ok: true, value: { mode: "dictation", lines: 1, correct: 1 } });
    expect(validateVideoStudy({ mode: "shadowing", lines: 20, correct: 0 }).ok).toBe(true);
  });
  it("từ chối chế độ của mini-game, số câu ngoài 1–20, đúng nhiều hơn số câu, số không nguyên", () => {
    for (const bad of [{ mode: "cloze", lines: 1, correct: 0 }, { mode: "dictation", lines: 0, correct: 0 }, { mode: "dictation", lines: 21, correct: 0 },
      { mode: "dictation", lines: 2, correct: 3 }, { mode: "dictation", lines: 1.5, correct: 1 }, { mode: "dictation", lines: 1, correct: -1 }, null, "x"]) {
      expect(validateVideoStudy(bad).ok).toBe(false);
    }
  });
});
