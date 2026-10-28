import { describe, expect, it } from "vitest";
import { isEligible, isSingleClause, shuffleDifferent, toTiles, wrongPositions } from "./word-order";

describe("xếp câu", () => {
  it("thẻ từ chỉ gồm từ có chữ Hán, bỏ dấu câu", () => {
    expect(toTiles([{ simplified: "我" }, { simplified: "想" }, { simplified: "," }, { simplified: "喝茶" }, { simplified: "。" }])).toEqual(["我", "想", "喝茶"]);
  });

  it("chỉ nhận câu một vế", () => {
    expect(isSingleClause("我想去医院。")).toBe(true);
    expect(isSingleClause("你好吗?")).toBe(true);
    expect(isSingleClause("两张大人票。熊猫在哪里?")).toBe(false);
    expect(isSingleClause("不用了,谢谢。")).toBe(false);
  });

  it("câu vừa sức: từ 3 đến 8 thẻ", () => {
    expect(isEligible(["我", "想"])).toBe(false);
    expect(isEligible(["我", "想", "喝茶"])).toBe(true);
    expect(isEligible(Array.from({ length: 9 }, (_, i) => String(i)))).toBe(false);
  });

  it("xáo trộn luôn khác thứ tự đúng, kể cả khi bộ số ngẫu nhiên trả toàn 0", () => {
    const tokens = ["我", "想", "去", "医院"];
    for (const v of [0, 0.5, 0.99]) {
      const out = shuffleDifferent(tokens, () => v);
      expect(out).not.toEqual(tokens);
      expect([...out].sort()).toEqual([...tokens].sort());
    }
    expect(shuffleDifferent(["好", "好"])).toEqual(["好", "好"]);
  });

  it("tìm đúng vị trí đặt sai", () => {
    expect(wrongPositions(["我", "想", "喝茶"], ["我", "想", "喝茶"])).toEqual([]);
    expect(wrongPositions(["想", "我", "喝茶"], ["我", "想", "喝茶"])).toEqual([0, 1]);
    expect(wrongPositions(["我"], ["我", "想"])).toEqual([1]);
  });
});
