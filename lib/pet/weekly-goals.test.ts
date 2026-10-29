import { describe, expect, it } from "vitest";
import { bumpWeekly, canClaim, claimWeek, emptyWeekly, mondayOf, parseWeekly, rollWeek, weeklyRows } from "./weekly-goals";

const W = "2026-10-26";

describe("mondayOf", () => {
  it("chủ nhật thuộc tuần của thứ Hai trước đó", () => {
    expect(mondayOf(new Date(2026, 9, 29, 15).getTime())).toBe("2026-10-26");
    expect(mondayOf(new Date(2026, 10, 1, 23).getTime())).toBe("2026-10-26");
    expect(mondayOf(new Date(2026, 10, 2, 0, 5).getTime())).toBe("2026-11-02");
  });
});

describe("weekly goals", () => {
  it("sang tuần mới thì xóa số đếm nhưng giữ tuần đã nhận", () => {
    const s = { ...bumpWeekly(emptyWeekly, "2026-10-19", "write"), claimed: ["2026-10-12"] };
    const r = rollWeek(s, W);
    expect(r).toMatchObject({ week: W, write: 0, readIds: [], claimed: ["2026-10-12"] });
  });
  it("mỗi truyện chỉ tính một lần", () => {
    let s = bumpWeekly(emptyWeekly, W, "read", "a");
    s = bumpWeekly(s, W, "read", "a");
    s = bumpWeekly(s, W, "read", "b");
    expect(weeklyRows(s, W, 0).find((r) => r.id === "read")).toMatchObject({ have: 2, done: true });
  });
  it("đủ ba mục tiêu mới nhận được, và chỉ nhận một lần mỗi tuần", () => {
    let s = emptyWeekly;
    for (let i = 0; i < 10; i++) s = bumpWeekly(s, W, "write");
    s = bumpWeekly(bumpWeekly(s, W, "read", "a"), W, "read", "b");
    expect(canClaim(s, W, 4)).toBe(false);
    expect(canClaim(s, W, 5)).toBe(true);
    s = claimWeek(s, W);
    expect(canClaim(s, W, 7)).toBe(false);
    expect(claimWeek(s, W).claimed).toEqual([W]);
  });
  it("số đếm vượt mục tiêu vẫn hiện tối đa mục tiêu", () => {
    let s = emptyWeekly;
    for (let i = 0; i < 15; i++) s = bumpWeekly(s, W, "write");
    expect(weeklyRows(s, W, 0).find((r) => r.id === "write")?.have).toBe(10);
  });
  it("parse bỏ dữ liệu sai dạng", () => {
    expect(parseWeekly("x")).toEqual(emptyWeekly);
    expect(parseWeekly({ week: 5, write: -3, readIds: [1, "a"], claimed: "z" })).toEqual({ week: "", write: 0, readIds: ["a"], claimed: [] });
  });
});
