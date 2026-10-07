import { describe, expect, it } from "vitest";
import { generateChallengeCode, normalizeChallengeCode } from "./challenge-code";

describe("challenge code", () => {
  it("sinh mã 8 ký tự hợp lệ", () => {
    for (let i = 0; i < 50; i++) expect(normalizeChallengeCode(generateChallengeCode())).not.toBeNull();
  });
  it("chuẩn hóa chữ thường và khoảng trắng", () => {
    expect(normalizeChallengeCode(" abcd2345 ")).toBe("ABCD2345");
  });
  it("từ chối sai độ dài hoặc ký tự dễ nhầm", () => {
    expect(normalizeChallengeCode("ABC")).toBeNull();
    expect(normalizeChallengeCode("ABCD2340")).toBeNull();
    expect(normalizeChallengeCode("ABCDEFGI")).toBeNull();
  });
});
