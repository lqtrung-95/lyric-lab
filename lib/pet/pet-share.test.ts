import { describe, expect, it } from "vitest";
import { chipRows, compactXp, confetti, daysTogether, shareChips, shareFileName, sparkles } from "./pet-share";

describe("số liệu thẻ khoe", () => {
  it("đếm ngày bên nhau, ngày nhận nuôi là ngày 1", () => {
    const t = Date.parse("2026-10-01T08:00:00Z");
    expect(daysTogether("2026-10-01T08:00:00Z", t)).toBe(1);
    expect(daysTogether("2026-10-01T08:00:00Z", t + 86_400_000 * 3)).toBe(4);
    expect(daysTogether("không phải ngày", t)).toBe(1);
  });
  it("XP gọn", () => {
    expect(compactXp(950)).toBe("950");
    expect(compactXp(1240)).toBe("1,2k");
    expect(compactXp(2000)).toBe("2k");
    expect(compactXp(-5)).toBe("0");
  });
  it("bỏ ô chưa có nghĩa", () => {
    const labels = (s: Parameters<typeof shareChips>[0]) => shareChips(s).map((c) => c.label);
    expect(labels({ level: 3, streak: 0, xpSince: 10, daysTogether: 2, taughtWords: 0 })).toEqual(["Cấp", "XP cùng nhau", "Bên nhau"]);
    expect(labels({ level: 3, streak: 5, xpSince: 10, daysTogether: 2, taughtWords: 4 })).toHaveLength(5);
  });
});

describe("trang trí cố định", () => {
  it("lấp lánh nằm trong khung và không đổi giữa các lần gọi", () => {
    const a = sparkles(14);
    expect(a).toEqual(sparkles(14));
    expect(a).toHaveLength(14);
    expect(a.every((s) => s.x >= 4 && s.x <= 96 && s.y >= 4 && s.y <= 94)).toBe(true);
  });
  it("confetti đủ số lượng, vị trí trong 0..100", () => {
    const c = confetti(26);
    expect(c).toHaveLength(26);
    expect(c.every((p) => p.x >= 0 && p.x < 100 && p.duration > 1)).toBe(true);
  });
  it("tên tệp an toàn", () => {
    expect(shareFileName("Tiểu Long!")).toBe("songhanzi-tiểu-long.png");
    expect(shareFileName("???")).toBe("songhanzi-pet.png");
  });
});

describe("chipRows", () => {
  it("chia hàng cân đối, không để 3+1", () => {
    expect([0, 1, 2, 3, 4, 5].map(chipRows)).toEqual([[], [1], [2], [3], [2, 2], [3, 2]]);
  });
});
