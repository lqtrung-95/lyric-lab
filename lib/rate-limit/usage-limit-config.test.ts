import { describe, expect, it } from "vitest";
import { usageLimit, usageWindowHours } from "./usage-limit-config";

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

  it("điểm luyện tập: 40 lượt mỗi giờ, cửa sổ đếm 1 giờ; các loại khác 24 giờ", () => {
    expect(usageLimit("score", true)).toBe(40);
    expect(usageWindowHours("score")).toBe(1);
    expect(usageWindowHours("analyze")).toBe(24);
  });

  it("phòng thi đấu: tạo phòng theo 24 giờ, thử vào phòng theo 1 giờ; đã đăng nhập luôn nhiều hơn ẩn danh", () => {
    expect(usageLimit("room", true)).toBe(10);
    expect(usageWindowHours("room")).toBe(24);
    expect(usageLimit("room_join", true)).toBe(30);
    expect(usageWindowHours("room_join")).toBe(1);
    for (const kind of ["room", "room_join", "ask", "voice"] as const) expect(usageLimit(kind, false)).toBeGreaterThan(usageLimit(kind, true));
  });
});
