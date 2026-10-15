import { describe, expect, it } from "vitest";
import type { ToneGuess } from "./pitch";
import type { ToneId } from "./tone-data";
import { toneFeedback } from "./tone-feedback";

const guess = (tone: ToneId | null, confidence = 0.8): ToneGuess => ({ tone, confidence, range: 5 });
const TONES: ToneId[] = [1, 2, 3, 4];

describe("toneFeedback", () => {
  it("đúng thanh và chắc chắn thì khen; đúng nhưng mờ thì báo gần đúng", () => {
    for (const t of TONES) expect(toneFeedback(t, guess(t, 0.9))).toMatchObject({ verdict: "match" });
    expect(toneFeedback(2, guess(2, 0.1)).verdict).toBe("close");
  });
  it("mọi cặp thanh nhầm đều có lời khuyên riêng nêu hướng giọng", () => {
    for (const target of TONES) for (const got of TONES) {
      if (target === got) continue;
      const fb = toneFeedback(target, guess(got));
      expect(fb.verdict).toBe("miss");
      expect(fb.message.length).toBeGreaterThan(30);
    }
    expect(toneFeedback(2, guess(3)).message).toContain("xuống trước");
    expect(toneFeedback(3, guess(2)).message).toContain("xuống thấp");
    expect(toneFeedback(4, guess(2)).message).toContain("xuống mạnh");
  });
  it("không dò được cao độ thì báo đọc lại, không chấm sai", () => {
    expect(toneFeedback(1, guess(null, 0)).verdict).toBe("unclear");
  });
});
