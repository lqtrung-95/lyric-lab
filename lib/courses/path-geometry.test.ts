import { describe, expect, it } from "vitest";
import { mapHeight, nodePositions, roadPath, ROW_HEIGHT } from "./path-geometry";

describe("nodePositions", () => {
  it("y tăng đều theo hàng, x luôn nằm trong khung và đường thực sự uốn lượn", () => {
    const pts = nodePositions(36);
    expect(pts).toHaveLength(36);
    pts.forEach((p, i) => { expect(p.y).toBe((i + 0.5) * ROW_HEIGHT); expect(p.x).toBeGreaterThanOrEqual(10); expect(p.x).toBeLessThanOrEqual(90); });
    expect(new Set(pts.map((p) => Math.round(p.x))).size).toBeGreaterThan(8);
  });
  it("hai nút liền kề không bao giờ trùng vị trí", () => {
    const pts = nodePositions(36);
    for (let i = 1; i < pts.length; i++) expect(Math.hypot(pts[i].x - pts[i - 1].x, (pts[i].y - pts[i - 1].y) / 6)).toBeGreaterThan(5);
  });
});

describe("roadPath", () => {
  it("bắt đầu ở điểm đầu và có một đoạn cong cho mỗi cặp nút", () => {
    const pts = nodePositions(5);
    const d = roadPath(pts);
    expect(d.startsWith(`M ${pts[0].x.toFixed(2).replace(/\.?0+$/, "")}`)).toBe(true);
    expect(d.match(/ C /g)).toHaveLength(4);
    expect(roadPath([])).toBe("");
  });
  it("chiều cao khung tỉ lệ với số hàng", () => { expect(mapHeight(36)).toBe(36 * ROW_HEIGHT); });
});
