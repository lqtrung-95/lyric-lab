import { describe, expect, it } from "vitest";
import { usageLimit } from "./usage-limit-config";

describe("usageLimit", () => {
  it("phân tích bài mới: 10 cho ẩn danh, 30 cho đã đăng nhập (PRD §7)", () => {
    expect(usageLimit("analyze", true)).toBe(10);
    expect(usageLimit("analyze", false)).toBe(30);
  });

  it("tài khoản đã đăng nhập luôn được hạn mức cao hơn ẩn danh", () => {
    for (const kind of ["analyze", "explain"] as const) {
      expect(usageLimit(kind, false)).toBeGreaterThan(usageLimit(kind, true));
    }
  });
});
