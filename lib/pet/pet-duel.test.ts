import { describe, expect, it } from "vitest";
import type { GameWord } from "@/lib/games/game-word";
import { PET_SPECIES } from "./pet-logic";
import { DUEL_OPTIONS, PET_DUEL_STYLE, addDuelOutcome, duelOutcome, makeDuelRound, parseDuelRecord, petPlan, resolveTap } from "./pet-duel";

const W = (han: string): GameWord => ({ han, pinyin: "p", meaning: "m" });
const POOL = ["你", "好", "吗", "我", "他", "她"].map(W);
const seq = (...v: number[]) => { let i = 0; return () => v[i++ % v.length]; };

describe("tính cách pet", () => {
  it("mọi loài đều có tính cách hợp lệ", () => {
    for (const sp of PET_SPECIES) {
      const s = PET_DUEL_STYLE[sp];
      expect(s.accuracy).toBeGreaterThan(0);
      expect(s.accuracy).toBeLessThan(1);
      expect(s.speedMs).toBeGreaterThan(1000);
    }
  });
  it("lớn hơn thì chắc và nhanh hơn", () => {
    // 0.6 vượt độ chính xác giai đoạn 1 của mèo (0,58) nhưng nằm trong giai đoạn 3 (0,68).
    expect(petPlan("cat", 1, seq(0.6, 0.5)).correct).toBe(false);
    expect(petPlan("cat", 3, seq(0.6, 0.5)).correct).toBe(true);
    expect(petPlan("cat", 3, seq(0.1, 0.5)).atMs).toBeLessThan(petPlan("cat", 1, seq(0.1, 0.5)).atMs);
  });
  it("thời gian bấm nằm trong ±30% quanh mức trung bình", () => {
    const base = PET_DUEL_STYLE.owl.speedMs;
    expect(petPlan("owl", 1, seq(0, 0)).atMs).toBe(Math.round(base * 0.7));
    expect(petPlan("owl", 1, seq(0, 1)).atMs).toBe(Math.round(base * 1.3));
  });
});

describe("makeDuelRound", () => {
  it("4 lựa chọn khác nhau, có đáp án", () => {
    const r = makeDuelRound(POOL, new Set(), Math.random)!;
    expect(r.options).toHaveLength(DUEL_OPTIONS);
    expect(new Set(r.options.map((o) => o.han)).size).toBe(DUEL_OPTIONS);
    expect(r.options.some((o) => o.han === r.answer.han)).toBe(true);
  });
  it("tránh từ đã hỏi khi còn từ khác, hết thì cho lặp", () => {
    const used = new Set(["你", "好", "吗", "我", "他"]);
    expect(makeDuelRound(POOL, used, Math.random)!.answer.han).toBe("她");
    expect(makeDuelRound(POOL, new Set(POOL.map((w) => w.han)), Math.random)).not.toBeNull();
  });
  it("ít hơn 4 từ khác nhau thì không dựng được", () => {
    expect(makeDuelRound([W("你"), W("你"), W("好"), W("吗")], new Set(), Math.random)).toBeNull();
  });
});

describe("kết quả", () => {
  it("thắng, thua, hòa", () => {
    expect(duelOutcome(3, 2)).toBe("win");
    expect(duelOutcome(1, 2)).toBe("lose");
    expect(duelOutcome(2, 2)).toBe("draw");
  });
  it("người chơi chỉ được điểm khi đúng và pet chưa ghi điểm", () => {
    expect(resolveTap(true, false)).toBe("user");
    expect(resolveTap(true, true)).toBe("none");
    expect(resolveTap(false, false)).toBe("none");
  });
  it("kỷ lục cộng dồn và đọc lại an toàn", () => {
    const r = addDuelOutcome(addDuelOutcome(parseDuelRecord(null), "win"), "draw");
    expect(r).toEqual({ win: 1, lose: 0, draw: 1 });
    expect(parseDuelRecord({ win: -3, lose: "x", draw: 2.7 })).toEqual({ win: 0, lose: 0, draw: 2 });
  });
});
