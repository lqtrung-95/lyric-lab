import { describe, expect, it } from "vitest";
import { paperLayout } from "./writing-paper";

describe("paperLayout", () => {
  it("số cột và hàng vừa trang A4 với lề cho trước", () => {
    const l = paperLayout({ type: "tianzige", cellMm: 20, marginMm: 10 });
    expect(l.cols).toBe(9); // (210 - 20) / 20 = 9,5
    expect(l.rows).toBe(13); // (297 - 20) / 20 = 13,85
  });

  it("田字格: mỗi ô có chữ thập đứt (2 đoạn), 米字格 thêm 2 đường chéo", () => {
    const t = paperLayout({ type: "tianzige", cellMm: 20, marginMm: 10 });
    const m = paperLayout({ type: "mizige", cellMm: 20, marginMm: 10 });
    const dashed = (l: ReturnType<typeof paperLayout>) => l.segments.filter((s) => s.dashed).length;
    expect(dashed(t)).toBe(t.cols * t.rows * 2);
    expect(dashed(m)).toBe(m.cols * m.rows * 4);
  });

  it("ô vuông trơn không có đường đứt", () => {
    const l = paperLayout({ type: "square", cellMm: 15, marginMm: 10 });
    expect(l.segments.some((s) => s.dashed)).toBe(false);
  });

  it("pinyin: mỗi hàng có bốn dòng pinyin (hai dòng giữa đứt) và hàng ít hơn vì có dải pinyin", () => {
    const plain = paperLayout({ type: "tianzige", cellMm: 20, marginMm: 10 });
    const py = paperLayout({ type: "pinyin", cellMm: 20, marginMm: 10 });
    expect(py.rows).toBeLessThan(plain.rows);
    const first = py.segments.slice(0, 4);
    expect(first.map((s) => !!s.dashed)).toEqual([false, true, true, false]);
  });

  it("mọi đoạn nằm trong trang và cỡ ô, lề ngoài khoảng cho phép được kẹp lại", () => {
    const l = paperLayout({ type: "mizige", cellMm: 999, marginMm: -5 });
    const xs = l.segments.flatMap((s) => [s.x1, s.x2]);
    const ys = l.segments.flatMap((s) => [s.y1, s.y2]);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...xs)).toBeLessThanOrEqual(210);
    expect(Math.min(...ys)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...ys)).toBeLessThanOrEqual(297);
  });
});
