import { describe, expect, it } from "vitest";
import { dailyPoints, parseGuess } from "./daily-guess";
import { EMPTY_DAILY, guessesFor, parseDaily, withGuess, withResult } from "./daily-store";

describe("parseGuess", () => {
  it("nhận hai âm tiết có số thanh", () => {
    expect(parseGuess("peng2 you3")?.norm).toBe("peng2 you3");
    expect(parseGuess("Peng2You3")?.norm).toBe("peng2 you3");
    expect(parseGuess("xue2 xi2")?.syls[0]).toEqual({ initial: "x", final: "ue", tone: 2 });
  });
  it("loại dạng sai", () => {
    for (const bad of ["", "peng you", "peng2", "peng2 you3 ma1", "peng2 you9", "qqq1 you3", "peng2 !you3"]) expect(parseGuess(bad)).toBeNull();
  });
  it("điểm giảm theo số lượt, trong trần 150", () => {
    expect(dailyPoints(1)).toBe(150);
    expect(dailyPoints(6)).toBeLessThan(dailyPoints(2));
    expect(dailyPoints(6)).toBeGreaterThanOrEqual(30);
  });
});

describe("daily store", () => {
  it("lượt đoán thuộc về ngày của nó", () => {
    const b = withGuess(withGuess(EMPTY_DAILY, "2026-10-28", "a1 b2"), "2026-10-28", "c3 d4");
    expect(guessesFor(b, "2026-10-28")).toEqual(["a1 b2", "c3 d4"]);
    expect(guessesFor(b, "2026-10-29")).toEqual([]);
  });
  it("chuỗi thắng liên tiếp và bị ngắt", () => {
    let b = withResult(EMPTY_DAILY, "2026-10-28", true);
    expect(b.stats.streak).toBe(1);
    b = withResult(b, "2026-10-29", true);
    expect(b.stats.streak).toBe(2);
    b = withResult(b, "2026-10-31", true); // bỏ lỡ một ngày
    expect(b.stats.streak).toBe(1);
    b = withResult(b, "2026-11-01", false);
    expect(b.stats).toMatchObject({ streak: 0, played: 4, wins: 3 });
  });
  it("đọc dữ liệu hỏng thì về rỗng", () => {
    expect(parseDaily("không phải json")).toEqual(EMPTY_DAILY);
    expect(parseDaily('{"today":{"key":1}}').today).toBeNull();
  });
});
