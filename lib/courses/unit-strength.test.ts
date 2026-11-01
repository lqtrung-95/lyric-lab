import { describe, expect, it } from "vitest";
import type { MemoryRow } from "@/lib/srs/retrievability";
import { unitStrength } from "./unit-strength";

const now = new Date("2026-11-01T00:00:00Z");
const mem = (daysAgo: number, stability: number): MemoryRow => ({ reps: 3, stability, last_review: new Date(now.getTime() - daysAgo * 86_400_000).toISOString(), due: now.toISOString() });
const NEW: MemoryRow = { reps: 0, stability: 0, last_review: null, due: now.toISOString() };

describe("độ bền của chặng", () => {
  it("chặng mới ôn gần đây thì bền, không cần ôn", () => {
    const m = new Map([["猫", mem(1, 20)], ["狗", mem(1, 20)], ["鱼", mem(2, 20)], ["鸟", mem(1, 20)]]);
    const s = unitStrength(["猫", "狗", "鱼", "鸟"], m, now);
    expect(s.known).toBe(4);
    expect(s.strengthPct).toBeGreaterThan(95);
    expect(s.needsReview).toBe(false);
  });
  it("nhiều từ lâu không ôn thì báo cần ôn", () => {
    const m = new Map([["猫", mem(30, 5)], ["狗", mem(30, 5)], ["鱼", mem(30, 5)], ["鸟", mem(1, 20)]]);
    const s = unitStrength(["猫", "狗", "鱼", "鸟"], m, now);
    expect(s.fading).toBe(3);
    expect(s.needsReview).toBe(true);
    expect(s.strengthPct).toBeLessThan(80);
  });
  it("một hai từ lẻ sắp quên chưa đủ để báo", () => {
    const m = new Map([["猫", mem(30, 5)], ["狗", mem(30, 5)], ["鱼", mem(1, 20)], ["鸟", mem(1, 20)], ["马", mem(1, 20)], ["牛", mem(1, 20)]]);
    expect(unitStrength(["猫", "狗", "鱼", "鸟", "马", "牛"], m, now).needsReview).toBe(false);
  });
  it("từ chưa có thẻ hoặc chưa ôn không tính; không từ nào thì không có số", () => {
    const m = new Map([["猫", NEW]]);
    expect(unitStrength(["猫", "狗"], m, now)).toEqual({ known: 0, fading: 0, strengthPct: null, needsReview: false });
  });
});
