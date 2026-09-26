import { describe, expect, it } from "vitest";
import { computeStreak, dayKey, shiftDay } from "./streak-logic";

const TODAY = "2026-09-27"; // Chủ nhật

describe("dayKey", () => {
  it("theo múi giờ người dùng, không theo UTC", () => {
    const at = new Date("2026-09-26T18:30:00Z"); // 01:30 ngày 27 ở Việt Nam
    expect(dayKey(at, "Asia/Ho_Chi_Minh")).toBe("2026-09-27");
    expect(dayKey(at, "UTC")).toBe("2026-09-26");
  });
});

describe("computeStreak", () => {
  it("chưa có hoạt động: mọi thứ bằng 0", () => {
    const s = computeStreak([], TODAY);
    expect([s.current, s.longest, s.studiedToday, s.weekCount]).toEqual([0, 0, false, 0]);
  });
  it("đếm liên tiếp tính cả hôm nay", () => {
    expect(computeStreak(["2026-09-25", "2026-09-26", TODAY], TODAY).current).toBe(3);
  });
  it("hôm nay chưa học nhưng hôm qua đã học: giữ chuỗi", () => {
    const s = computeStreak(["2026-09-25", "2026-09-26"], TODAY);
    expect([s.current, s.studiedToday]).toEqual([2, false]);
  });
  it("lỡ một ngày trọn vẹn thì chuỗi về 0 nhưng giữ kỷ lục", () => {
    const s = computeStreak(["2026-09-20", "2026-09-21", "2026-09-22", "2026-09-25"], TODAY);
    expect([s.current, s.longest]).toEqual([0, 3]);
  });
  it("qua ranh giới tháng và năm", () => {
    expect(shiftDay("2026-03-01", -1)).toBe("2026-02-28");
    expect(computeStreak(["2025-12-31", "2026-01-01"], "2026-01-01").current).toBe(2);
  });
  it("tuần bắt đầu từ thứ Hai và đếm số ngày đã học", () => {
    const s = computeStreak(["2026-09-20", "2026-09-21", "2026-09-24", TODAY], TODAY); // 21/9 là thứ Hai
    expect(s.week.map((w) => w.day)[0]).toBe("2026-09-21");
    expect(s.week[6].isToday).toBe(true);
    expect(s.weekCount).toBe(3); // 20/9 thuộc tuần trước
  });
});
