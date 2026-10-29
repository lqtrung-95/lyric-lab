import { describe, expect, it } from "vitest";
import { PET_SPEECH_PER_DAY, pickPetLine, spendSpeech } from "./pet-speech";

describe("pickPetLine", () => {
  it("quay vòng qua các câu và có tên khi câu cần", () => {
    const a = pickPetLine("hungry", "Mi", 0);
    const b = pickPetLine("hungry", "Mi", 1);
    expect(a).not.toBe(b);
    expect(pickPetLine("hungry", "Mi", 4)).toBe(a);
    expect(pickPetLine("hungry", "Mi", 0)).toContain("Mi");
  });
  it("seed lạ vẫn cho ra một câu", () => {
    expect(pickPetLine("sleepy", "Mi", -7).length).toBeGreaterThan(0);
    expect(pickPetLine("happy", "Mi", Number.NaN).length).toBeGreaterThan(0);
  });
});

describe("spendSpeech", () => {
  it("cho nói tới hết hạn mức ngày", () => {
    let b = null as ReturnType<typeof spendSpeech>["next"] | null;
    for (let i = 0; i < PET_SPEECH_PER_DAY; i++) {
      const r = spendSpeech(b, "2026-10-29");
      expect(r.allowed).toBe(true);
      b = r.next;
    }
    expect(spendSpeech(b, "2026-10-29").allowed).toBe(false);
  });
  it("sang ngày mới thì tính lại", () => {
    expect(spendSpeech({ day: "2026-10-28", count: 99 }, "2026-10-29")).toEqual({ allowed: true, next: { day: "2026-10-29", count: 1 } });
  });
});
