import { describe, expect, it } from "vitest";
import { activeDaysInLastWeek, daysBetween, isWeeklyDay, lastStudiedDay, shouldSendReminder, shouldSendWeekly } from "./email-schedule";

const now = new Date("2026-10-12T02:00:00Z"); // thứ Hai 09:00 giờ Việt Nam
const daysAgo = (n: number) => new Date(now.getTime() - n * 86_400_000).toISOString();

describe("lịch gửi email", () => {
  it("đếm số ngày và ngày học gần nhất", () => {
    expect(daysBetween("2026-10-07", "2026-10-12")).toBe(5);
    expect(lastStudiedDay(new Set(["2026-10-01", "2026-10-09", "2026-10-03"]))).toBe("2026-10-09");
    expect(lastStudiedDay(new Set())).toBeNull();
  });
  it("đếm ngày học trong 7 ngày gần nhất", () => {
    expect(activeDaysInLastWeek(new Set(["2026-10-12", "2026-10-10", "2026-10-06", "2026-10-05"]), "2026-10-12")).toBe(3);
  });
  it("tổng kết tuần: cần bật, có học, và cách lần trước ≥ 6 ngày", () => {
    expect(shouldSendWeekly({ enabled: true, lastSentAt: null, activeDays: 2 }, now)).toBe(true);
    expect(shouldSendWeekly({ enabled: true, lastSentAt: daysAgo(7), activeDays: 2 }, now)).toBe(true);
    expect(shouldSendWeekly({ enabled: true, lastSentAt: daysAgo(2), activeDays: 2 }, now)).toBe(false);
    expect(shouldSendWeekly({ enabled: true, lastSentAt: null, activeDays: 0 }, now)).toBe(false);
    expect(shouldSendWeekly({ enabled: false, lastSentAt: null, activeDays: 3 }, now)).toBe(false);
  });
  it("nhắc quay lại: chỉ khi bỏ học 3–30 ngày và lần nhắc trước ≥ 7 ngày", () => {
    const ok = { enabled: true, lastSentAt: null, inactiveDays: 4 };
    expect(shouldSendReminder(ok, now)).toBe(true);
    expect(shouldSendReminder({ ...ok, inactiveDays: 2 }, now)).toBe(false);
    expect(shouldSendReminder({ ...ok, inactiveDays: 31 }, now)).toBe(false);
    expect(shouldSendReminder({ ...ok, inactiveDays: null }, now)).toBe(false);
    expect(shouldSendReminder({ ...ok, lastSentAt: daysAgo(3) }, now)).toBe(false);
    expect(shouldSendReminder({ ...ok, enabled: false }, now)).toBe(false);
  });
  it("nhận biết thứ Hai theo giờ Việt Nam", () => {
    expect(isWeeklyDay(now)).toBe(true);
    expect(isWeeklyDay(new Date("2026-10-11T20:00:00Z"))).toBe(true); // Chủ nhật 20:00 UTC = thứ Hai 03:00 VN
    expect(isWeeklyDay(new Date("2026-10-13T02:00:00Z"))).toBe(false);
  });
});
