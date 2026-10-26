import { describe, expect, it } from "vitest";
import { layoutWordMap, nodeSize, NODE_HEIGHT, type MapGroup, type PlacedNode } from "./word-map-layout";

const node = (t: string) => ({ term: t, pinyin: "p", meaning: "m" });
const group = (id: MapGroup["id"], terms: string[]): MapGroup => ({ id, label: id, shortLabel: id, nodes: terms.map(node) });
const overlap = (a: PlacedNode, b: PlacedNode) => Math.abs(a.x - b.x) < (a.w + b.w) / 2 && Math.abs(a.y - b.y) < (a.h + b.h) / 2;
const all = (groups: ReturnType<typeof layoutWordMap>["groups"]) => groups.flatMap((g) => g.nodes);

describe("nodeSize", () => {
  it("nút rộng theo số chữ, từ dài vẫn bị chặn ở bề ngang cột", () => {
    expect(nodeSize("爱").w).toBeLessThan(nodeSize("喜喜欢欢").w);
    expect(nodeSize("一二三四五六七八").w).toBeLessThanOrEqual(160);
  });
  it("chữ đủ nhỏ để nằm trong nút (rộng nút ≥ số chữ × cỡ chữ)", () => {
    for (const t of ["爱", "喜欢", "招人喜欢", "一二三四五六七八"]) {
      const { w, fontSize } = nodeSize(t);
      expect(w).toBeGreaterThanOrEqual([...t].length * fontSize);
    }
  });
});

describe("layoutWordMap", () => {
  const three = layoutWordMap([group("compound", ["喜喜欢欢", "讨人喜欢", "招人喜欢", "爱好"]), group("radical", ["和", "吧", "吗", "呢"]), group("theme", ["睡觉", "听到", "看见", "看到"])]);
  it("bỏ nhóm rỗng, cắt tối đa 4 nút mỗi nhóm", () => {
    const out = layoutWordMap([group("compound", ["a", "b", "c", "d", "e"]), group("radical", [])]);
    expect(out.groups).toHaveLength(1);
    expect(out.groups[0].nodes.length).toBeLessThanOrEqual(4);
  });
  it("không có hai nút nào chồng nhau, kể cả từ dài (ba nhóm)", () => {
    const nodes = all(three.groups);
    for (let i = 0; i < nodes.length; i++) for (let j = i + 1; j < nodes.length; j++) expect(overlap(nodes[i], nodes[j]), `${nodes[i].term} × ${nodes[j].term}`).toBe(false);
  });
  it("mọi nút nằm trong khung ngang và cao đủ vùng bấm 44px", () => {
    for (const n of all(three.groups)) {
      expect(n.x - n.w / 2).toBeGreaterThanOrEqual(0);
      expect(n.x + n.w / 2).toBeLessThanOrEqual(three.width);
      expect(n.h).toBeGreaterThanOrEqual(44);
      expect(n.y + n.h / 2).toBeLessThanOrEqual(three.height);
    }
  });
  it("nhãn nhóm không đè lên nút nào", () => {
    for (const g of three.groups) for (const n of all(three.groups)) {
      const labelHalfW = 45;
      const hit = Math.abs(g.labelX - n.x) < labelHalfW + n.w / 2 && Math.abs(g.labelY - n.y) < 8 + n.h / 2;
      expect(hit, `${g.label} × ${n.term}`).toBe(false);
    }
  });
  it("hai nhóm: nhóm thứ hai là hàng phía dưới từ đang xem", () => {
    const two = layoutWordMap([group("compound", ["爱好"]), group("theme", ["睡觉"])]);
    expect(two.groups[1].nodes[0].y).toBeGreaterThan(two.center.y);
    expect(NODE_HEIGHT).toBe(44);
  });
});
