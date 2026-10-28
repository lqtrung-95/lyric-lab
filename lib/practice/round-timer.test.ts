import { describe, expect, it } from "vitest";
import { maxRoundPoints } from "./scoring";
import { roundDurationSec, secondsLeft, wordGamePoints } from "./round-timer";

describe("đồng hồ vòng chơi", () => {
  it("giây còn lại làm tròn lên và không âm", () => {
    expect(secondsLeft(0, 0, 20)).toBe(20);
    expect(secondsLeft(0, 500, 20)).toBe(20);
    expect(secondsLeft(0, 1000, 20)).toBe(19);
    expect(secondsLeft(0, 19_100, 20)).toBe(1);
    expect(secondsLeft(0, 20_000, 20)).toBe(0);
    expect(secondsLeft(0, 99_000, 20)).toBe(0);
  });

  it("thời lượng lượt không thấp hơn tối thiểu mỗi câu", () => {
    expect(roundDurationSec(0, 5_000, 8)).toBe(24);
    expect(roundDurationSec(0, 90_000, 8)).toBe(90);
  });

  it("điểm các trò từ vựng nằm dưới trần của máy chủ, kể cả khi nhân 1,5 chơi cùng bạn", () => {
    expect(wordGamePoints(8)).toBe(800);
    expect(wordGamePoints(8, true)).toBe(1200);
    for (const mode of ["truth", "truthduo", "order"] as const) expect(wordGamePoints(8, true)).toBeLessThanOrEqual(maxRoundPoints(mode, 8));
  });
});
