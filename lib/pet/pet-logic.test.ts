import { describe, expect, it } from "vitest";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";
import { PET_NAME_MAX, cleanPetName, parsePet, petGrowth, petMood, unlockedAccessories } from "./pet-logic";

describe("cleanPetName", () => {
  it("bỏ khoảng trắng thừa và cắt theo số ký tự", () => {
    expect(cleanPetName("  Mi   Mi ")).toBe("Mi Mi");
    expect([...cleanPetName("x".repeat(40))!]).toHaveLength(PET_NAME_MAX);
  });
  it("không cắt đôi ký tự ngoài BMP", () => {
    expect(cleanPetName("🐉".repeat(30))).toBe("🐉".repeat(PET_NAME_MAX));
  });
  it("rỗng hoặc sai kiểu thì null", () => {
    for (const v of ["", "   ", null, undefined, 5]) expect(cleanPetName(v)).toBeNull();
  });
});

describe("parsePet", () => {
  it("nhận dữ liệu đúng dạng", () => {
    expect(parsePet({ species: "panda", name: " Bo ", adoptedAt: "2026-10-29T00:00:00.000Z" })).toEqual({ species: "panda", name: "Bo", adoptedAt: "2026-10-29T00:00:00.000Z" });
  });
  it("loài lạ, thiếu tên hoặc không phải object thì null", () => {
    expect(parsePet({ species: "unicorn", name: "A" })).toBeNull();
    expect(parsePet({ species: "cat", name: "" })).toBeNull();
    for (const v of [null, "cat", 3, undefined]) expect(parsePet(v)).toBeNull();
  });
  it("ngày hỏng thì dùng mốc 1970, không làm hỏng pet", () => {
    expect(parsePet({ species: "cat", name: "A", adoptedAt: "xx" })?.adoptedAt).toBe(new Date(0).toISOString());
  });
});

describe("petGrowth", () => {
  it("ngưỡng 300 và 1500 XP", () => {
    expect(petGrowth(0)).toMatchObject({ stage: 1, progressXp: 0, nextXp: 300, maxed: false });
    expect(petGrowth(299).stage).toBe(1);
    expect(petGrowth(300)).toMatchObject({ stage: 2, progressXp: 0, nextXp: 1200 });
    expect(petGrowth(1499).stage).toBe(2);
    expect(petGrowth(1500)).toMatchObject({ stage: 3, nextXp: 0, maxed: true });
  });
  it("XP âm, NaN hoặc lẻ không làm hỏng", () => {
    expect(petGrowth(-5).stage).toBe(1);
    expect(petGrowth(Number.NaN).stage).toBe(1);
    expect(petGrowth(300.9).stage).toBe(2);
  });
});

describe("petMood", () => {
  const goal = (items: number, target = 10) => dailyGoalProgress(items, target);
  it("đạt mục tiêu thì vui, dù đã lâu bỏ học trước đó", () => expect(petMood(goal(10), 0)).toBe("happy"));
  it("chưa đạt mục tiêu: đói, và ngủ khi bỏ từ 3 ngày", () => {
    expect(petMood(goal(3), 0)).toBe("hungry");
    expect(petMood(goal(0), 2)).toBe("hungry");
    expect(petMood(goal(0), 3)).toBe("sleepy");
    expect(petMood(goal(0), null)).toBe("hungry");
  });
  it("tắt mục tiêu thì chỉ cần học gì đó trong ngày", () => {
    expect(petMood(goal(1, 0), 0)).toBe("happy");
    expect(petMood(goal(0, 0), 1)).toBe("hungry");
  });
});

describe("unlockedAccessories", () => {
  it("mở theo chuỗi dài nhất 7, 30, 100 ngày", () => {
    expect(unlockedAccessories(6)).toHaveLength(0);
    expect(unlockedAccessories(7).map((a) => a.id)).toEqual(["scarf"]);
    expect(unlockedAccessories(100).map((a) => a.id)).toEqual(["scarf", "hat", "crown"]);
  });
});
