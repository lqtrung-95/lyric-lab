import { describe, expect, it } from "vitest";
import { dayBounds } from "./day-bounds";

describe("dayBounds", () => {
  it("Việt Nam (UTC+7): 00:00 địa phương = 17:00 UTC hôm trước", () => {
    const { start, end } = dayBounds(new Date("2026-03-10T20:30:00Z"), "Asia/Ho_Chi_Minh"); // 03:30 ngày 11
    expect(start.toISOString()).toBe("2026-03-10T17:00:00.000Z");
    expect(end.toISOString()).toBe("2026-03-11T17:00:00.000Z");
  });

  it("sát nửa đêm: 23:59 và 00:01 thuộc hai ngày khác nhau", () => {
    const tz = "Asia/Ho_Chi_Minh";
    const before = dayBounds(new Date("2026-03-10T16:59:00Z"), tz); // 23:59 ngày 10
    const after = dayBounds(new Date("2026-03-10T17:01:00Z"), tz); // 00:01 ngày 11
    expect(before.end.getTime()).toBe(after.start.getTime());
  });

  it("múi giờ âm và giờ mùa hè (New York, ngày đổi giờ 8/3/2026): ngày ngắn 23 giờ", () => {
    const { start, end } = dayBounds(new Date("2026-03-08T18:00:00Z"), "America/New_York");
    expect(start.toISOString()).toBe("2026-03-08T05:00:00.000Z");
    expect(end.toISOString()).toBe("2026-03-09T04:00:00.000Z");
  });

  it("UTC", () => {
    expect(dayBounds(new Date("2026-03-10T12:00:00Z"), "UTC").start.toISOString()).toBe("2026-03-10T00:00:00.000Z");
  });
});
