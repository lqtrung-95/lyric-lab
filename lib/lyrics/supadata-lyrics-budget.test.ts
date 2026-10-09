import { describe, expect, it } from "vitest";
import { SUPADATA_SONGS_PER_MONTH, decideSupadataLyricsBudget, monthStartIso } from "./supadata-lyrics-budget";

describe("decideSupadataLyricsBudget", () => {
  it("còn hạn mức khi chưa đủ số bài trong tháng", () => expect(decideSupadataLyricsBudget(SUPADATA_SONGS_PER_MONTH - 1)).toBe("ok"));
  it("hết hạn mức khi đã đủ", () => expect(decideSupadataLyricsBudget(SUPADATA_SONGS_PER_MONTH)).toBe("exhausted"));
});

describe("monthStartIso", () => {
  it("trả về 0 giờ ngày 1 của tháng hiện tại theo UTC", () => expect(monthStartIso(new Date("2026-10-17T13:45:00Z"))).toBe("2026-10-01T00:00:00.000Z"));
});
