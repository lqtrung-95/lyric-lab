import { describe, expect, it } from "vitest";
import { petReactionFor, petReactionLine, type PetSnapshot } from "./pet-reaction";

const snap = (o: Partial<PetSnapshot> = {}): PetSnapshot => ({ level: 3, streak: 4, mood: "hungry", ...o });

describe("petReactionFor", () => {
  it("không phản ứng khi chưa có ảnh trước hoặc không đổi", () => {
    expect(petReactionFor(null, snap())).toBeNull();
    expect(petReactionFor(snap(), null)).toBeNull();
    expect(petReactionFor(snap(), snap())).toBeNull();
  });
  it("nhận ra từng sự kiện", () => {
    expect(petReactionFor(snap(), snap({ level: 4 }))).toBe("levelUp");
    expect(petReactionFor(snap(), snap({ streak: 5 }))).toBe("streakUp");
    expect(petReactionFor(snap(), snap({ mood: "happy" }))).toBe("goalDone");
    expect(petReactionFor(snap({ streak: 6 }), snap({ streak: 0 }))).toBe("streakLost");
  });
  it("ưu tiên cái to nhất khi nhiều thứ cùng đổi", () => {
    expect(petReactionFor(snap(), snap({ level: 4, streak: 5, mood: "happy" }))).toBe("levelUp");
    expect(petReactionFor(snap(), snap({ streak: 5, mood: "happy" }))).toBe("streakUp");
  });
  it("đã vui rồi thì đạt mục tiêu không báo lại; chuỗi 0 sẵn thì không buồn", () => {
    expect(petReactionFor(snap({ mood: "happy" }), snap({ mood: "happy" }))).toBeNull();
    expect(petReactionFor(snap({ streak: 0 }), snap({ streak: 0 }))).toBeNull();
  });
});

describe("petReactionLine", () => {
  it("giọng nhẹ, không chữ nặng nề", () => {
    for (const r of ["levelUp", "streakUp", "goalDone", "streakLost"] as const) {
      expect(petReactionLine(r, "Mi")).not.toMatch(/chết|đói khổ|bỏ rơi|thất vọng/i);
    }
    expect(petReactionLine("goalDone", "Mi")).toContain("Mi");
  });
});
