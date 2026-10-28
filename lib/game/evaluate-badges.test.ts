import { describe, expect, it } from "vitest";
import { BADGES } from "./badge-catalog";
import type { BadgeFacts } from "./badge-catalog";
import { buildBadgeCatalog, evaluateBadges, highestTiers, mergeBadges } from "./evaluate-badges";

const zero: BadgeFacts = {
  learnedWords: 0, levelsCompleted: 0, totalReviews: 0, unitsCompleted: 0, level: 1, longestStreak: 0, songsCompleted: 0, dictationGood: 0, shadowingGood: 0,
  roomsPlayed: 0, roomsWon: 0, perfectRounds: 0, nightReviews: 0, earlyReviews: 0,
  exploreRounds: 0, casesSolved: 0, hardCasesSolved: 0, coopCasesSolved: 0, coopDays: 0,
};

describe("danh mục huy hiệu", () => {
  it("id duy nhất, mốc tăng dần, tối đa 4 bậc, đủ 6 nhóm", () => {
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
    for (const b of BADGES) {
      expect(b.thresholds.length).toBeLessThanOrEqual(4);
      expect(b.thresholds.every((t, i) => i === 0 || t > b.thresholds[i - 1])).toBe(true);
    }
    expect(new Set(BADGES.map((b) => b.group))).toEqual(new Set(["learn", "streak", "listen", "speak", "battle", "explore"]));
    expect(BADGES.some((b) => b.hidden)).toBe(true);
  });
});

describe("evaluateBadges", () => {
  it("Khám phá: Nhà thám hiểm theo lượt nhiệm vụ, Thám tử theo vụ án đã giải, riêng vụ Khó", () => {
    expect(evaluateBadges({ ...zero, exploreRounds: 3 })).toContainEqual({ id: "explore-rounds", tier: "bronze" });
    expect(evaluateBadges({ ...zero, casesSolved: 3 }).filter((b) => b.id === "explore-cases").map((b) => b.tier)).toEqual(["bronze", "silver"]);
    expect(evaluateBadges({ ...zero, hardCasesSolved: 1 })).toContainEqual({ id: "explore-hard", tier: "bronze" });
    expect(evaluateBadges({ ...zero, coopCasesSolved: 3 })).toContainEqual({ id: "explore-duo", tier: "silver" });
    expect(evaluateBadges({ ...zero, coopDays: 2 })).toContainEqual({ id: "explore-duo-days", tier: "bronze" });
    expect(evaluateBadges(zero).some((b) => b.id.startsWith("explore"))).toBe(false);
  });

  it("qua bài kiểm tra cuối cấp: huy hiệu Hoàn thành cấp HSK theo số cấp", () => {
    expect(evaluateBadges({ ...zero, levelsCompleted: 1 })).toContainEqual({ id: "learn-hsk", tier: "bronze" });
    expect(evaluateBadges({ ...zero, levelsCompleted: 4 }).filter((b) => b.id === "learn-hsk").map((b) => b.tier)).toEqual(["bronze", "silver", "gold"]);
  });
  it("chưa làm gì thì chưa có huy hiệu (cấp 1 chưa đủ mốc)", () => {
    expect(evaluateBadges(zero)).toEqual([]);
  });
  it("đạt bậc cao thì kéo theo các bậc thấp", () => {
    const got = evaluateBadges({ ...zero, longestStreak: 30 }).filter((b) => b.id === "streak-days").map((b) => b.tier);
    expect(got).toEqual(["bronze", "silver", "gold"]);
  });
  it("huy hiệu ẩn có bậc riêng theo số liệu", () => {
    expect(evaluateBadges({ ...zero, nightReviews: 1 })).toEqual([{ id: "hidden-night-owl", tier: "bronze" }]);
  });
});

describe("mergeBadges (cấp idempotent)", () => {
  const facts = { ...zero, songsCompleted: 5 };
  it("lần đầu: mọi bậc đạt là mới; chạy lại với dữ liệu đã lưu thì không có gì mới", () => {
    const first = mergeBadges([], facts);
    expect(first.fresh).toHaveLength(2);
    const stored = first.fresh.map((b) => ({ ...b, earnedAt: "2026-10-20T00:00:00Z" }));
    const second = mergeBadges(stored, facts);
    expect(second.fresh).toEqual([]);
    expect(second.earned).toEqual(stored);
  });
  it("giữ huy hiệu đã lưu dù số liệu tụt (không thu hồi) và bỏ id không còn trong danh mục", () => {
    const m = mergeBadges([{ id: "listen-songs", tier: "gold", earnedAt: "x" }, { id: "old-badge", tier: "bronze", earnedAt: "x" }], zero);
    expect(m.earned.map((b) => b.id)).toEqual(["listen-songs"]);
  });
});

describe("buildBadgeCatalog", () => {
  it("che huy hiệu ẩn chưa mở, lộ khi đã mở; báo bậc kế và tiến độ", () => {
    const facts = { ...zero, songsCompleted: 2, perfectRounds: 0 };
    const earned = mergeBadges([], facts).earned;
    const cat = buildBadgeCatalog(facts, earned);
    const hidden = cat.find((b) => b.id === "hidden-perfect")!;
    expect(hidden).toMatchObject({ title: "???", unlocked: false, hidden: true });
    const songs = cat.find((b) => b.id === "listen-songs")!;
    expect(songs).toMatchObject({ unlocked: true, tier: "bronze", nextTier: "silver", progress: 2, nextTarget: 5 });
    expect(songs.hint).toContain("5");
    const unlockedHidden = buildBadgeCatalog({ ...zero, nightReviews: 1 }, mergeBadges([], { ...zero, nightReviews: 1 }).earned).find((b) => b.id === "hidden-night-owl")!;
    expect(unlockedHidden.title).toBe("Cú đêm");
  });
  it("highestTiers chọn bậc cao nhất", () => {
    expect(highestTiers([{ id: "a", tier: "bronze", earnedAt: null }, { id: "a", tier: "gold", earnedAt: null }]).get("a")).toBe("gold");
  });
});
