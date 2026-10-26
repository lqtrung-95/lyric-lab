import { describe, expect, it } from "vitest";
import { layoutWordMap, MAP_HEIGHT, MAP_WIDTH, type MapGroup } from "./word-map-layout";

const node = (t: string) => ({ term: t, pinyin: "p", meaning: "m" });
const groups: MapGroup[] = [
  { id: "compound", label: "Từ ghép", shortLabel: "Từ ghép", nodes: ["一", "二", "三", "四", "五"].map(node) },
  { id: "radical", label: "Cùng bộ", shortLabel: "Bộ", nodes: [node("六")] },
  { id: "theme", label: "Chủ đề", shortLabel: "Chủ đề", nodes: [] },
];

describe("layoutWordMap", () => {
  const out = layoutWordMap(groups);
  it("bỏ nhóm rỗng và cắt mỗi nhóm tối đa 4 nút", () => {
    expect(out.groups.map((g) => g.id)).toEqual(["compound", "radical"]);
    expect(out.groups[0].nodes).toHaveLength(4);
  });
  it("mọi nút nằm trong khung và đủ cách nhau để vùng bấm 44px không chồng (cùng nhóm)", () => {
    for (const g of out.groups) for (const n of g.nodes) {
      expect(n.x).toBeGreaterThan(22); expect(n.x).toBeLessThan(MAP_WIDTH - 22);
      expect(n.y).toBeGreaterThan(22); expect(n.y).toBeLessThan(MAP_HEIGHT - 22);
    }
    const ns = out.groups[0].nodes;
    for (let i = 1; i < ns.length; i++) expect(Math.hypot(ns[i].x - ns[i - 1].x, ns[i].y - ns[i - 1].y)).toBeGreaterThanOrEqual(44);
  });
  it("hai nhóm thì đặt trên và dưới, một nút đặt đúng hướng của nhóm", () => {
    expect(out.groups[0].hubY).toBeLessThan(out.center.y);
    expect(out.groups[1].hubY).toBeGreaterThan(out.center.y);
    expect(out.groups[1].nodes[0].y).toBeGreaterThan(out.center.y);
  });
});
