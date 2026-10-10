import { describe, expect, it } from "vitest";
import { toneOfSyllable } from "./pinyin-tone";

describe("toneOfSyllable", () => {
  it("nhận thanh 1–4 từ dấu, kể cả dạng ghép sẵn", () => {
    expect(toneOfSyllable("mā")).toBe(1);
    expect(toneOfSyllable("má")).toBe(2);
    expect(toneOfSyllable("mǎ")).toBe(3);
    expect(toneOfSyllable("mà")).toBe(4);
    expect(toneOfSyllable("lǜ")).toBe(4);
  });
  it("không dấu là thanh nhẹ (0)", () => expect(toneOfSyllable("ma")).toBe(0));
});
