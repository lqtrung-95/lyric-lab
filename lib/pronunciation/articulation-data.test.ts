import { describe, expect, it } from "vitest";
import { DIAGRAM_SHAPES } from "@/components/pronunciation/tongue-diagram-shapes";
import { COMPARE_GROUPS, GROUP_ARTICULATION, SOUND_ARTICULATION } from "./articulation-data";
import { FINAL_GROUPS, INITIAL_GROUPS } from "./pinyin-chart-data";

describe("vị trí lưỡi và cách phát âm", () => {
  const groups = new Map([...INITIAL_GROUPS, ...FINAL_GROUPS].map((g) => [g.id, g]));
  const symbols = new Set([...groups.values()].flatMap((g) => g.sounds.map((s) => s.symbol)));

  it("mọi nhóm và âm có mô tả đều trỏ tới nhóm/âm có thật trong bảng pinyin", () => {
    for (const id of Object.keys(GROUP_ARTICULATION)) expect(groups.has(id), id).toBe(true);
    for (const sym of Object.keys(SOUND_ARTICULATION)) expect(symbols.has(sym), sym).toBe(true);
    for (const c of COMPARE_GROUPS) expect(groups.has(c.id), c.id).toBe(true);
  });

  it("mọi mô tả đều có hình tương ứng và chữ mô tả", () => {
    for (const a of [...Object.values(GROUP_ARTICULATION), ...Object.values(SOUND_ARTICULATION)]) {
      expect(DIAGRAM_SHAPES[a.diagram], a.diagram).toBeDefined();
      expect(a.where.length).toBeGreaterThan(10);
      expect(a.how.length).toBeGreaterThan(0);
    }
  });

  it("các nhóm phụ âm đầu có hình (trừ bán nguyên âm y, w)", () => {
    for (const g of INITIAL_GROUPS.filter((x) => x.id !== "ban-nguyen-am")) expect(GROUP_ARTICULATION[g.id], g.id).toBeDefined();
  });
});
