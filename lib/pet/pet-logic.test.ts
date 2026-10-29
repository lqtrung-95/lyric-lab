import { describe, expect, it } from "vitest";
import { dailyGoalProgress } from "@/lib/streak/daily-goal";
import { PET_NAME_MAX, cleanPetName, daysSinceStudy, evolvedStage, parsePet, petGrowth, petMood, unlockedAccessories } from "./pet-logic";

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
    expect(parsePet({ species: "panda", name: " Bo ", adoptedAt: "2026-10-29T00:00:00.000Z" })).toEqual({ species: "panda", name: "Bo", adoptedAt: "2026-10-29T00:00:00.000Z", baseXp: 0 });
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

describe("parsePet baseXp", () => {
  it("giữ XP lúc nhận nuôi; thiếu, âm hoặc sai kiểu thì 0", () => {
    expect(parsePet({ species: "cat", name: "A", baseXp: 1234.7 })?.baseXp).toBe(1234);
    for (const v of [undefined, -5, "9", Number.NaN]) expect(parsePet({ species: "cat", name: "A", baseXp: v })?.baseXp).toBe(0);
  });
});

describe("petGrowth theo XP kể từ lúc nhận nuôi", () => {
  it("người đã có 3000 XP nhận nuôi thì pet vẫn bắt đầu từ con non", () => {
    expect(petGrowth(3000, 3000)).toMatchObject({ stage: 1, progressXp: 0 });
    expect(petGrowth(3300, 3000).stage).toBe(2);
    expect(petGrowth(4500, 3000).stage).toBe(3);
  });
  it("XP tổng giảm xuống dưới mốc nhận nuôi (hoàn tác) không làm âm", () => {
    expect(petGrowth(100, 500)).toMatchObject({ stage: 1, progressXp: 0 });
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

describe("daysSinceStudy", () => {
  const week = (studied: number[], todayIdx: number) => Array.from({ length: 7 }, (_, i) => ({ day: `2026-10-${String(26 + i).padStart(2, "0")}`, studied: studied.includes(i), isToday: i === todayIdx }));
  it("học hôm nay = 0; chuỗi còn sống = 1", () => {
    expect(daysSinceStudy({ studiedToday: true, current: 3, longest: 3, week: week([2], 2) })).toBe(0);
    expect(daysSinceStudy({ studiedToday: false, current: 2, longest: 2, week: week([1], 2) })).toBe(1);
  });
  it("chuỗi đứt: đếm từ ngày học gần nhất trong tuần", () => {
    expect(daysSinceStudy({ studiedToday: false, current: 0, longest: 5, week: week([0], 4) })).toBe(4);
  });
  it("không thấy ngày học trong tuần thì 7; chưa từng học thì null", () => {
    expect(daysSinceStudy({ studiedToday: false, current: 0, longest: 5, week: week([], 3) })).toBe(7);
    expect(daysSinceStudy({ studiedToday: false, current: 0, longest: 0, week: week([], 3) })).toBeNull();
  });
});

describe("evolvedStage", () => {
  it("chỉ báo khi giai đoạn cao hơn lần đã thấy", () => {
    expect(evolvedStage(1, 2)).toBe(2);
    expect(evolvedStage(1, 3)).toBe(3);
  });
  it("lần đầu, không đổi hoặc tụt thì không báo", () => {
    expect(evolvedStage(null, 3)).toBeNull();
    expect(evolvedStage(2, 2)).toBeNull();
    expect(evolvedStage(3, 2)).toBeNull();
  });
});
