import { describe, expect, it } from "vitest";
import { computeStreakWithFreezes, planFreezes } from "./streak-freeze";
import { computeStreak } from "./streak-logic";

const TODAY = "2026-10-20"; // thứ Ba

describe("computeStreakWithFreezes", () => {
  it("không có đóng băng thì giống hệt computeStreak (không đổi hành vi cũ)", () => {
    const sets = [[], ["2026-10-20"], ["2026-10-19", "2026-10-20"], ["2026-10-19"], ["2026-10-17", "2026-10-18", "2026-10-20"], ["2026-09-01", "2026-09-02", "2026-09-03", "2026-10-19"]];
    for (const s of sets) {
      const a = computeStreak(s, TODAY);
      const b = computeStreakWithFreezes(s, [], TODAY);
      expect({ c: b.current, l: b.longest, t: b.studiedToday, w: b.weekCount }).toEqual({ c: a.current, l: a.longest, t: a.studiedToday, w: a.weekCount });
    }
  });
  it("ngày đóng băng nối chuỗi nhưng không tăng số ngày học", () => {
    const s = computeStreakWithFreezes(["2026-10-17", "2026-10-18", "2026-10-20"], ["2026-10-19"], TODAY);
    expect(s.current).toBe(3); // 17, 18, 20 (19 là đóng băng, không đếm)
    expect(s.longest).toBe(3);
    expect(s.week.find((w) => w.day === "2026-10-19")).toMatchObject({ frozen: true, studied: false });
    expect(s.weekCount).toBe(1); // tuần này bắt đầu 19/10: chỉ ngày 20 là ngày học
  });
  it("hôm nay chưa học nhưng hôm qua đóng băng vẫn giữ chuỗi", () => {
    expect(computeStreakWithFreezes(["2026-10-17", "2026-10-18"], ["2026-10-19"], TODAY).current).toBe(2);
  });
  it("đóng băng đứng riêng không tạo chuỗi", () => {
    expect(computeStreakWithFreezes([], ["2026-10-19"], TODAY).current).toBe(0);
  });
});

describe("planFreezes", () => {
  it("cứu ngày hôm qua bị lỡ khi hôm kia còn trong chuỗi", () => {
    expect(planFreezes(["2026-10-17", "2026-10-18"], [], TODAY, 1)).toEqual(["2026-10-19"]);
  });
  it("cứu cả khi hôm nay đã học (người dùng quay lại)", () => {
    expect(planFreezes(["2026-10-18", "2026-10-20"], [], TODAY, 1)).toEqual(["2026-10-19"]);
  });
  it("không có lượt thì không dùng; hết lượt thì dừng", () => {
    expect(planFreezes(["2026-10-18"], [], TODAY, 0)).toEqual([]);
    expect(planFreezes(["2026-10-14", "2026-10-16", "2026-10-18"], [], TODAY, 1)).toEqual(["2026-10-19"]);
  });
  it("lỡ hai ngày liên tiếp thì chuỗi đã đứt, không cứu", () => {
    expect(planFreezes(["2026-10-16", "2026-10-17"], [], TODAY, 2)).toEqual([]);
  });
  it("không tạo chuỗi từ hư vô và không vá lịch sử đã đứt từ trước", () => {
    expect(planFreezes([], [], TODAY, 2)).toEqual([]);
    expect(planFreezes(["2026-10-01", "2026-10-03"], [], TODAY, 2)).toEqual([]);
  });
  it("idempotent: sau khi áp kết quả, chạy lại không chọn thêm", () => {
    const studied = ["2026-10-16", "2026-10-18", "2026-10-19"];
    const first = planFreezes(studied, [], TODAY, 2);
    expect(first).toEqual(["2026-10-17"]);
    expect(planFreezes(studied, first, TODAY, 2)).toEqual([]);
  });
  it("hôm nay chưa học và hôm qua đã học thì không cần đóng băng", () => {
    expect(planFreezes(["2026-10-19"], [], TODAY, 2)).toEqual([]);
  });
});
