import { describe, expect, it } from "vitest";
import type { StreakData } from "@/lib/streak/load-streak";
import type { Pet } from "./pet-logic";
import { computePetView } from "./pet-view";

const pet: Pet = { species: "cat", name: "Mi", adoptedAt: "2026-10-01T00:00:00.000Z", baseXp: 1000 };
const streak = (over: Partial<StreakData>): StreakData => ({
  current: 3, longest: 7, studiedToday: true, weekCount: 3, learnedWords: 0, videoLines: 0, todayItems: 10, dailyGoal: 10,
  week: [{ day: "2026-10-29", studied: true, isToday: true }], ...over,
});

describe("computePetView", () => {
  it("giai đoạn tính từ XP kiếm được sau lúc nhận nuôi", () => {
    expect(computePetView(pet, 1000, streak({})).growth.stage).toBe(1);
    expect(computePetView(pet, 1300, streak({})).growth.stage).toBe(2);
  });
  it("đạt mục tiêu ngày thì vui, và mở phụ kiện theo chuỗi dài nhất", () => {
    const v = computePetView(pet, 1000, streak({}));
    expect(v.mood).toBe("happy");
    expect(v.accessories).toEqual(["scarf"]);
  });
  it("chưa đạt mục tiêu thì đói", () => {
    expect(computePetView(pet, 1000, streak({ todayItems: 2, studiedToday: false })).mood).toBe("hungry");
  });
  it("chuỗi chưa tải xong: đói, không phụ kiện", () => {
    expect(computePetView(pet, 1000, undefined)).toMatchObject({ mood: "hungry", accessories: [] });
    expect(computePetView(pet, 1000, null).accessories).toEqual([]);
  });
});
