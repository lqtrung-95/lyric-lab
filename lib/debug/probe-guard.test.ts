import { describe, expect, it } from "vitest";
import { isProbeAuthorized } from "./probe-guard";

const SECRET = "0123456789abcdef-secret";

describe("isProbeAuthorized", () => {
  it("chỉ chấp nhận đúng secret", () => {
    expect(isProbeAuthorized(SECRET, SECRET)).toBe(true);
    expect(isProbeAuthorized(SECRET, "sai")).toBe(false);
    expect(isProbeAuthorized(SECRET, SECRET + "x")).toBe(false);
    expect(isProbeAuthorized(SECRET, null)).toBe(false);
  });
  it("tắt hẳn khi chưa đặt secret hoặc secret quá ngắn", () => {
    expect(isProbeAuthorized(undefined, "abc")).toBe(false);
    expect(isProbeAuthorized("", "")).toBe(false);
    expect(isProbeAuthorized("ngan", "ngan")).toBe(false);
  });
});
