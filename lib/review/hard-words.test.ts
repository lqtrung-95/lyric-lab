import { describe, expect, it } from "vitest";
import { hardScore, pickHardWords, type HardCardLike } from "./hard-words";

const card = (term: string, o: Partial<HardCardLike> = {}): HardCardLike => ({ item_key: `k:${term}`, kind: "vocab", term, reps: 5, lapses: 0, difficulty: 5, stability: 20, state: 2, due: "2026-01-01", ...o });

describe("hardScore", () => {
  it("thẻ chưa đủ lần ôn thì 0", () => expect(hardScore(card("a", { reps: 1, lapses: 3 }))).toBe(0));
  it("quên nhiều và khó hơn thì điểm cao hơn", () => {
    expect(hardScore(card("a", { lapses: 4, difficulty: 8 }))).toBeGreaterThan(hardScore(card("b", { lapses: 1, difficulty: 6 })));
  });
  it("thẻ bền và dễ gần 0", () => expect(hardScore(card("a"))).toBe(0));
  it("trần số lần quên", () => expect(hardScore(card("a", { lapses: 50 }))).toBe(hardScore(card("a", { lapses: 8 }))));
});

describe("pickHardWords", () => {
  it("lọc từ vựng khó, xếp từ khó nhất, giới hạn số lượng", () => {
    const r = pickHardWords([card("易"), card("难", { lapses: 3 }), card("更难", { lapses: 5, difficulty: 9 }), card("语法", { kind: "grammar", lapses: 9 })], 2);
    expect(r.map((c) => c.term)).toEqual(["更难", "难"]);
  });
});
