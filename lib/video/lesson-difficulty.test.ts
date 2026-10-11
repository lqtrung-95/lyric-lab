import { describe, expect, it } from "vitest";
import { clampLineSeconds, estimateLessonLevel } from "./lesson-difficulty";

const levels = (easy: number, hard: number) => [...Array(easy).fill(1), ...Array(hard).fill(null)] as (number | null)[];

describe("estimateLessonLevel", () => {
  it("chưa đủ lượt từ thì null", () => expect(estimateLessonLevel({ tokenLevels: levels(10, 5), hanChars: 50, speakingSeconds: 16 })).toBeNull());
  it("toàn từ HSK 1–3 và tốc độ bình thường là cấp 1", () => {
    expect(estimateLessonLevel({ tokenLevels: levels(100, 0), hanChars: 320, speakingSeconds: 100 })).toBe(1);
  });
  it("tỉ lệ từ HSK 1–3 càng thấp thì cấp càng cao (82% → 1,8; 64% → 4,0; 49% → 5,9)", () => {
    const at = (easyPct: number) => estimateLessonLevel({ tokenLevels: levels(easyPct, 100 - easyPct), hanChars: 320, speakingSeconds: 100 });
    expect(at(82)).toBe(1.8);
    expect(at(64)).toBe(4);
    expect(at(49)).toBe(5.9);
  });
  it("nói nhanh cộng tối đa 0,6 cấp, nói chậm trừ tối đa 0,6; không vượt khung 1–7", () => {
    const base = { tokenLevels: levels(70, 30) };
    const normal = estimateLessonLevel({ ...base, hanChars: 320, speakingSeconds: 100 })!;
    expect(estimateLessonLevel({ ...base, hanChars: 700, speakingSeconds: 100 })).toBeCloseTo(normal + 0.6, 1);
    expect(estimateLessonLevel({ ...base, hanChars: 50, speakingSeconds: 100 })).toBeCloseTo(normal - 0.6, 1);
    expect(estimateLessonLevel({ tokenLevels: levels(0, 100), hanChars: 900, speakingSeconds: 100 })).toBe(7);
    expect(estimateLessonLevel({ tokenLevels: levels(100, 0), hanChars: 10, speakingSeconds: 100 })).toBe(1);
  });
});

describe("clampLineSeconds", () => {
  it("kẹp 0,5–10 giây mỗi dòng", () => {
    expect([0, 3, 30].map(clampLineSeconds)).toEqual([0.5, 3, 10]);
  });
});
