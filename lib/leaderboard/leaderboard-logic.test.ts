import { describe, expect, it } from "vitest";
import { NICKNAME_MAX, normalizeNickname, validateNickname } from "./nickname";
import { validateScore } from "./validate-score";
import { formatTimeLeft, weekEnd, weekStart } from "./week";

describe("nickname", () => {
  it("chấp nhận tên hợp lệ, kể cả tiếng Việt có dấu và Hán tự", () => {
    for (const ok of ["Lan Anh", "Nguyễn_Văn.A", "học-chữ-Hán", "小明123", "abc"]) expect(validateNickname(ok)).toBeNull();
  });

  it("từ chối tên quá ngắn/dài, ký tự lạ, chỉ gồm số", () => {
    expect(validateNickname("ab")).toBe("too_short");
    expect(validateNickname("  ab  ")).toBe("too_short");
    expect(validateNickname("a".repeat(NICKNAME_MAX + 1))).toBe("too_long");
    expect(validateNickname("me@mail.com")).toBe("invalid_chars");
    expect(validateNickname("<b>hi</b>")).toBe("invalid_chars");
    expect(validateNickname("12345")).toBe("only_digits");
  });

  it("chuẩn hóa khoảng trắng", () => {
    expect(normalizeNickname("  Lan    Anh ")).toBe("Lan Anh");
  });
});

describe("weekStart / weekEnd (thứ Hai 00:00 giờ Việt Nam)", () => {
  it("giữa tuần: về thứ Hai gần nhất", () => {
    // Thứ Tư 2026-03-11 10:00 giờ VN = 03:00 UTC
    expect(weekStart(new Date("2026-03-11T03:00:00Z")).toISOString()).toBe("2026-03-08T17:00:00.000Z"); // thứ Hai 9/3 00:00 VN
    expect(weekEnd(new Date("2026-03-11T03:00:00Z")).toISOString()).toBe("2026-03-15T17:00:00.000Z");
  });

  it("ranh giới: Chủ nhật 23:59 VN vẫn thuộc tuần cũ, thứ Hai 00:00 VN sang tuần mới", () => {
    const sunday = new Date("2026-03-15T16:59:00Z"); // Chủ nhật 15/3 23:59 VN
    const monday = new Date("2026-03-15T17:00:00Z"); // thứ Hai 16/3 00:00 VN
    expect(weekStart(sunday).toISOString()).toBe("2026-03-08T17:00:00.000Z");
    expect(weekStart(monday).toISOString()).toBe("2026-03-15T17:00:00.000Z");
  });

  it("formatTimeLeft chọn đơn vị phù hợp", () => {
    expect(formatTimeLeft(3 * 86_400_000 + 5 * 3_600_000)).toBe("3 ngày 5 giờ");
    expect(formatTimeLeft(2 * 86_400_000)).toBe("2 ngày");
    expect(formatTimeLeft(5 * 3_600_000)).toBe("5 giờ");
    expect(formatTimeLeft(12 * 60_000)).toBe("12 phút");
    expect(formatTimeLeft(-5)).toBe("1 phút");
  });
});

describe("validateScore", () => {
  const good = { mode: "cloze", points: 620, correct: 6, total: 8, durationSec: 60 };

  it("nhận lượt hợp lệ", () => {
    expect(validateScore(good)).toEqual({ ok: true, value: good });
    expect(validateScore({ mode: "match", points: 400, correct: 6, total: 6, durationSec: 30 }).ok).toBe(true);
  });

  it("từ chối chế độ lạ, kiểu sai, số âm hoặc không nguyên, đúng > tổng", () => {
    for (const bad of [null, "x", { ...good, mode: "hack" }, { ...good, points: -1 }, { ...good, points: 1.5 }, { ...good, correct: 9 }, { ...good, total: 0 }, { ...good, total: 99 }, { ...good, points: "600" }]) {
      expect(validateScore(bad)).toEqual({ ok: false, error: "invalid" });
    }
  });

  it("từ chối điểm vượt trần và lượt nhanh bất thường", () => {
    expect(validateScore({ ...good, points: 1201 })).toEqual({ ok: false, error: "too_many_points" }); // trần 8 câu = 1200
    expect(validateScore({ ...good, durationSec: 5 })).toEqual({ ok: false, error: "too_fast" });
    expect(validateScore({ mode: "match", points: 400, correct: 6, total: 6, durationSec: 1 })).toEqual({ ok: false, error: "too_fast" });
    expect(validateScore({ mode: "match", points: 441, correct: 6, total: 6, durationSec: 30 })).toEqual({ ok: false, error: "too_many_points" });
  });
});
