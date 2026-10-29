import { describe, expect, it } from "vitest";
import { FADE_AFTER_MS, progressKey, type ExploreProgress } from "./explore-progress";
import { newScenesToday, nextDestination, passportSummary, sceneStamp, TOP_TITLE, type SceneLike } from "./passport";

const NOW = Date.UTC(2026, 9, 29, 8, 0, 0);
const DAY = 24 * 60 * 60 * 1000;
const scene = (id: string, n: number, to: string[] = []): SceneLike => ({ id, objects: Array.from({ length: n }, (_, i) => ({ id: `o${i}` })), exits: to.map((t) => ({ to: t })) });
const prog = (entries: [string, string, Partial<{ at: number; seen: number; correct: number }>][]): ExploreProgress => ({
  terms: Object.fromEntries(entries.map(([s, o, v]) => [progressKey(s, o), { discoveredAt: v.at ?? NOW, lastSeenAt: v.seen ?? NOW, correct: v.correct ?? 0, wrong: 0 }])),
});

describe("sceneStamp", () => {
  const sc = scene("a", 3);
  it("chưa học gì thì chưa có dấu", () => {
    expect(sceneStamp(sc, prog([]), NOW)).toMatchObject({ tier: 0, learned: 0, total: 3, firstAt: null });
  });
  it("học một phần là Đã ghé, đủ từ là Thông thạo", () => {
    expect(sceneStamp(sc, prog([["a", "o0", {}]]), NOW).tier).toBe(1);
    expect(sceneStamp(sc, prog([["a", "o0", {}], ["a", "o1", {}], ["a", "o2", {}]]), NOW).tier).toBe(2);
  });
  it("Thổ địa khi đủ từ, mọi từ từng đúng và không từ nào phai", () => {
    const all = prog([["a", "o0", { correct: 1 }], ["a", "o1", { correct: 2 }], ["a", "o2", { correct: 1 }]]);
    expect(sceneStamp(sc, all, NOW).tier).toBe(3);
    const faded = prog([["a", "o0", { correct: 1, seen: NOW - FADE_AFTER_MS - 1 }], ["a", "o1", { correct: 1 }], ["a", "o2", { correct: 1 }]]);
    expect(sceneStamp(sc, faded, NOW)).toMatchObject({ tier: 2, faded: 1 });
  });
  it("firstAt là lần học sớm nhất; từ của cảnh khác không tính", () => {
    const p = prog([["a", "o0", { at: NOW - 3 * DAY }], ["a", "o1", { at: NOW }], ["b", "o0", { at: NOW - 9 * DAY }]]);
    expect(sceneStamp(sc, p, NOW).firstAt).toBe(NOW - 3 * DAY);
  });
});

describe("passportSummary", () => {
  const scenes = Array.from({ length: 12 }, (_, i) => scene(`s${i}`, 2));
  const stampsFor = (tiers: number[]) => Object.fromEntries(scenes.map((s, i) => [s.id, { tier: (tiers[i] ?? 0) as 0 | 1 | 2 | 3, learned: 0, total: 2, firstAt: null, faded: 0, notYetCorrect: 0 }]));
  it("đếm theo bậc và chọn danh hiệu theo số cảnh đã ghé", () => {
    const s = passportSummary(scenes, stampsFor([3, 2, 1, 1, 0]));
    expect(s.byTier).toEqual({ 0: 8, 1: 2, 2: 1, 3: 1 });
    expect(s.visited).toBe(4);
    expect(s.title).toBe("Du khách");
    expect(s.next).toMatchObject({ name: "Người khám phá", at: 10, remaining: 6 });
  });
  it("chưa ghé nơi nào là Khách vãng lai; ghé hết là Trưởng thị trấn", () => {
    expect(passportSummary(scenes, stampsFor([])).title).toBe("Khách vãng lai");
    const all = passportSummary(scenes, stampsFor(Array(12).fill(1)));
    expect(all.title).toBe(TOP_TITLE);
    expect(all.next).toBeNull();
  });
  it("danh hiệu tiếp theo không vượt quá số cảnh hiện có", () => {
    const few = Array.from({ length: 4 }, (_, i) => scene(`f${i}`, 1));
    const st = Object.fromEntries(few.map((s) => [s.id, { tier: 1 as const, learned: 1, total: 1, firstAt: 1, faded: 0, notYetCorrect: 0 }]));
    expect(passportSummary(few, { ...st, f3: { ...st.f3, tier: 0 } }).next).toMatchObject({ name: TOP_TITLE, remaining: 1 });
  });
});

describe("newScenesToday", () => {
  it("chỉ đếm cảnh lần đầu ghé trong ngày hôm nay", () => {
    const base = { tier: 1 as const, learned: 1, total: 2, faded: 0, notYetCorrect: 0 };
    const stamps = { a: { ...base, firstAt: NOW - 1000 }, b: { ...base, firstAt: NOW - 3 * DAY }, c: { ...base, firstAt: null } };
    expect(newScenesToday(stamps, NOW)).toBe(1);
  });
});

describe("nextDestination", () => {
  const scenes = [scene("a", 2, ["b"]), scene("b", 2, ["a", "c"]), scene("c", 2, ["b"]), scene("d", 2)];
  const st = (tiers: Record<string, number>) => Object.fromEntries(scenes.map((s) => [s.id, { tier: (tiers[s.id] ?? 0) as 0 | 1 | 2 | 3, learned: 0, total: 2, firstAt: null, faded: 0, notYetCorrect: 0 }]));
  it("ưu tiên cảnh chưa ghé liền kề cảnh vừa ghé", () => {
    expect(nextDestination(scenes, st({ a: 1, b: 1 }), "b")).toEqual({ sceneId: "c", reason: "neighbor" });
  });
  it("không có kề thì lấy cảnh chưa ghé đầu tiên", () => {
    expect(nextDestination(scenes, st({ a: 1, b: 1, c: 1 }), "c")).toEqual({ sceneId: "d", reason: "next" });
    expect(nextDestination(scenes, st({}), null)).toEqual({ sceneId: "a", reason: "next" });
  });
  it("ghé hết thì gợi ý cảnh bậc thấp nhất; tất cả Thổ địa thì không gợi ý", () => {
    expect(nextDestination(scenes, st({ a: 3, b: 2, c: 1, d: 3 }), "d")).toEqual({ sceneId: "c", reason: "polish" });
    expect(nextDestination(scenes, st({ a: 3, b: 3, c: 3, d: 3 }), "d")).toBeNull();
  });
});
