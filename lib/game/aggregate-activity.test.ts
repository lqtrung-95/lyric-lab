import { describe, expect, it } from "vitest";
import { aggregateActivity, makeLocalizer, sumDays, weekStart, type RawActivity } from "./aggregate-activity";

const empty: RawActivity = { reviews: [], rounds: [], songs: [], units: [], rooms: [] };

describe("makeLocalizer", () => {
  it("ngày và giờ theo múi giờ người dùng, không theo UTC", () => {
    const local = makeLocalizer("Asia/Ho_Chi_Minh");
    expect(local("2026-10-19T18:30:00Z")).toEqual({ day: "2026-10-20", hour: 1 });
    expect(makeLocalizer("UTC")("2026-10-19T18:30:00Z")).toEqual({ day: "2026-10-19", hour: 18 });
  });
  it("nửa đêm là giờ 0, không phải 24", () => {
    expect(makeLocalizer("UTC")("2026-10-19T00:05:00Z").hour).toBe(0);
  });
});

describe("aggregateActivity", () => {
  it("một lần ôn lúc 23:30 UTC rơi vào ngày hôm sau ở Việt Nam", () => {
    const { days } = aggregateActivity({ ...empty, reviews: [{ at: "2026-10-19T17:30:00Z" }] }, "Asia/Ho_Chi_Minh");
    expect(Object.keys(days)).toEqual(["2026-10-20"]);
    expect(days["2026-10-20"]).toMatchObject({ reviews: 1, nightReviews: 1 }); // 00:30 sáng
  });
  it("chép/nói video chỉ tính câu đạt; kết quả 0 đúng không thưởng; luyện tập 0 đúng không tính lượt", () => {
    const { days } = aggregateActivity({
      ...empty,
      rounds: [
        { at: "2026-10-20T03:00:00Z", mode: "dictation", correct: 1, total: 1 },
        { at: "2026-10-20T03:01:00Z", mode: "dictation", correct: 0, total: 1 },
        { at: "2026-10-20T03:02:00Z", mode: "shadowing", correct: 1, total: 1 },
        { at: "2026-10-20T03:03:00Z", mode: "cloze", correct: 0, total: 10 },
        { at: "2026-10-20T03:04:00Z", mode: "cloze", correct: 10, total: 10 },
      ],
    }, "UTC");
    expect(days["2026-10-20"]).toMatchObject({ dictationGood: 1, shadowingGood: 1, practiceRounds: 1, perfectRounds: 1, practiceRawXp: 25 });
  });
  it("chặng và thi đấu có XP nhưng không tính vào ngày học của chuỗi (giữ nguyên hành vi chuỗi cũ)", () => {
    const r = aggregateActivity({ ...empty, units: [{ at: "2026-10-20T03:00:00Z", bestScore: 90 }], rooms: [{ at: "2026-10-21T03:00:00Z", won: true }] }, "UTC");
    expect(r.studiedDays.size).toBe(0);
    expect(r.days["2026-10-20"]).toMatchObject({ unitsCompleted: 1, unitRawXp: 40 });
    expect(r.days["2026-10-21"]).toMatchObject({ roomsPlayed: 1, roomsWon: 1, roomRawXp: 25 });
  });
  it("ngày học gồm ôn thẻ, luyện tập và tiến độ nghe dở dang; chỉ bài nghe xong mới có XP", () => {
    const r = aggregateActivity({ ...empty, songs: [{ at: "2026-10-20T03:00:00Z", completed: false }, { at: "2026-10-21T03:00:00Z", completed: true }] }, "UTC");
    expect([...r.studiedDays].sort()).toEqual(["2026-10-20", "2026-10-21"]);
    expect(r.days["2026-10-20"].songsCompleted).toBe(0);
    expect(r.days["2026-10-21"].songsCompleted).toBe(1);
  });
  it("giờ sáng sớm được phân loại", () => {
    const { days } = aggregateActivity({ ...empty, reviews: [{ at: "2026-10-20T06:00:00Z" }, { at: "2026-10-20T03:00:00Z" }] }, "UTC");
    expect(days["2026-10-20"]).toMatchObject({ earlyReviews: 1, nightReviews: 1 });
  });
});

describe("sumDays / weekStart", () => {
  it("cộng đúng khoảng ngày (cả hai đầu)", () => {
    const { days } = aggregateActivity({ ...empty, reviews: ["2026-10-18", "2026-10-19", "2026-10-25", "2026-10-26"].map((d) => ({ at: `${d}T10:00:00Z` })) }, "UTC");
    expect(sumDays(days, "2026-10-19", "2026-10-25").reviews).toBe(2);
  });
  it("tuần bắt đầu thứ Hai", () => {
    expect(weekStart("2026-10-20")).toBe("2026-10-19"); // thứ Ba
    expect(weekStart("2026-10-19")).toBe("2026-10-19");
    expect(weekStart("2026-10-25")).toBe("2026-10-19"); // Chủ nhật
  });
});
