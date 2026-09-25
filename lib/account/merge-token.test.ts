import { describe, expect, it } from "vitest";
import { MERGE_TOKEN_TTL_MS, generateMergeToken, hashMergeToken, isMergeTokenFormat, mergeTokenExpiry } from "./merge-token";

describe("merge token", () => {
  it("mã sinh ra đúng định dạng và không trùng nhau", () => {
    const a = generateMergeToken();
    expect(isMergeTokenFormat(a)).toBe(true);
    expect(generateMergeToken()).not.toBe(a);
  });

  it("băm ổn định, khác với mã gốc", () => {
    const t = generateMergeToken();
    expect(hashMergeToken(t)).toBe(hashMergeToken(t));
    expect(hashMergeToken(t)).not.toBe(t);
    expect(hashMergeToken(t)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("từ chối chuỗi sai định dạng", () => {
    for (const bad of ["", "abc", 42, null, "a".repeat(44), `${"a".repeat(42)}!`]) expect(isMergeTokenFormat(bad)).toBe(false);
  });

  it("hết hạn sau 30 phút", () => {
    const now = new Date("2026-03-10T00:00:00Z");
    expect(mergeTokenExpiry(now).getTime() - now.getTime()).toBe(MERGE_TOKEN_TTL_MS);
  });
});
