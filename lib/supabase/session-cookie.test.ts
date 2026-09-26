import { describe, expect, it } from "vitest";
import { hasSupabaseSessionCookie } from "./session-cookie";

describe("hasSupabaseSessionCookie", () => {
  it("nhận cookie phiên, kể cả bản chia mảnh", () => {
    expect(hasSupabaseSessionCookie([{ name: "sb-abc123-auth-token" }])).toBe(true);
    expect(hasSupabaseSessionCookie([{ name: "x" }, { name: "sb-abc123-auth-token.0" }])).toBe(true);
  });

  it("bỏ qua cookie khác, kể cả code-verifier của đăng nhập đang dở", () => {
    expect(hasSupabaseSessionCookie([])).toBe(false);
    expect(hasSupabaseSessionCookie([{ name: "theme" }, { name: "sb-abc123-auth-token-code-verifier" }])).toBe(false);
  });
});
