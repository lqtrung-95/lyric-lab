import { describe, expect, it } from "vitest";
import { dayKey, dayNumber, pickDaily } from "./daily-word";

const words = Array.from({ length: 50 }, (_, i) => ({ han: `字${i}`, pinyin: "a b" }));

describe("daily word", () => {
  it("khóa ngày theo giờ Việt Nam", () => {
    expect(dayKey(new Date("2026-10-28T20:00:00Z"))).toBe("2026-10-29"); // 03:00 sáng 29/10 ở Việt Nam
    expect(dayKey(new Date("2026-10-28T10:00:00Z"))).toBe("2026-10-28");
  });
  it("số thứ tự ngày", () => {
    expect(dayNumber("2026-10-01")).toBe(1);
    expect(dayNumber("2026-10-28")).toBe(28);
    expect(dayNumber("2026-11-01")).toBe(32);
  });
  it("cùng ngày thì cùng từ, kho rỗng thì null", () => {
    expect(pickDaily(words, "2026-10-28")).toEqual(pickDaily(words, "2026-10-28"));
    expect(new Set(["2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31"].map((k) => pickDaily(words, k)?.han)).size).toBeGreaterThan(1);
    expect(pickDaily([], "2026-10-28")).toBeNull();
  });
});
