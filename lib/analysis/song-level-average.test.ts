import { describe, expect, it } from "vitest";
import { averageVocabLevel } from "./song-level-average";

describe("averageVocabLevel", () => {
  it("trung bình các từ vựng có cấp, làm tròn 1 chữ số, bỏ ngữ pháp và từ ngoài HSK", () => {
    expect(averageVocabLevel([
      { type: "vocab", level: 3 }, { type: "vocab", level: 4 }, { type: "vocab", level: 6 },
      { type: "vocab", level: null }, { type: "grammar", level: 1 },
    ])).toBe(4.3);
  });

  it("không có từ nào có cấp thì null", () => {
    expect(averageVocabLevel([{ type: "grammar", level: 2 }, { type: "vocab", level: null }])).toBeNull();
    expect(averageVocabLevel([])).toBeNull();
  });
});
