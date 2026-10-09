import { describe, expect, it } from "vitest";
import { LISTEN_TOUR_STEPS, placeTourCard, unionBox } from "./listen-tour";

const viewport = { width: 400, height: 800 };
const card = { width: 300, height: 160 };

describe("unionBox", () => {
  it("gộp nhiều khung và bỏ khung rỗng", () => {
    expect(unionBox([{ top: 10, left: 20, width: 30, height: 40 }, { top: 0, left: 0, width: 0, height: 0 }, { top: 60, left: 100, width: 50, height: 10 }]))
      .toEqual({ top: 10, left: 20, width: 130, height: 60 });
  });
  it("không có khung hợp lệ thì null", () => {
    expect(unionBox([])).toBeNull();
    expect(unionBox([{ top: 5, left: 5, width: 0, height: 20 }])).toBeNull();
  });
});

describe("placeTourCard", () => {
  it("đặt bên dưới khi còn chỗ, căn giữa theo khung đích", () => {
    expect(placeTourCard({ top: 100, left: 150, width: 100, height: 40 }, card, viewport)).toEqual({ top: 152, left: 50 });
  });
  it("hết chỗ bên dưới thì đặt bên trên", () => {
    expect(placeTourCard({ top: 700, left: 150, width: 100, height: 40 }, card, viewport)).toEqual({ top: 528, left: 50 });
  });
  it("không đủ chỗ cả hai phía thì sát đáy màn hình", () => {
    expect(placeTourCard({ top: 100, left: 150, width: 100, height: 650 }, card, viewport)).toEqual({ top: 628, left: 50 });
  });
  it("giữ thẻ trong màn hình theo chiều ngang", () => {
    expect(placeTourCard({ top: 100, left: 0, width: 20, height: 40 }, card, viewport).left).toBe(12);
    expect(placeTourCard({ top: 100, left: 380, width: 20, height: 40 }, card, viewport).left).toBe(88);
  });
});

describe("LISTEN_TOUR_STEPS", () => {
  it("mỗi bước có tiêu đề, nội dung và ít nhất một đích; id không trùng", () => {
    for (const s of LISTEN_TOUR_STEPS) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.body.length).toBeGreaterThan(0);
      expect(s.targets.length).toBeGreaterThan(0);
    }
    expect(new Set(LISTEN_TOUR_STEPS.map((s) => s.id)).size).toBe(LISTEN_TOUR_STEPS.length);
  });
});
