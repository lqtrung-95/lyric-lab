import { describe, expect, it } from "vitest";
import { emptyDay } from "./aggregate-activity";
import { buildLedger, dayLedger, DAILY_CAPS, practiceRoundXp, roomXp, totalXp, unitXp } from "./xp-rules";

describe("công thức XP", () => {
  it("lượt luyện tập: chỉ tính câu đúng, thưởng khi đúng hết lượt đủ dài, 0 đúng = 0 XP", () => {
    expect(practiceRoundXp(0, 10)).toBe(0);
    expect(practiceRoundXp(7, 10)).toBe(14);
    expect(practiceRoundXp(10, 10)).toBe(25);
    expect(practiceRoundXp(3, 3)).toBe(6); // lượt ngắn không có thưởng hoàn hảo
  });
  it("chặng và thi đấu", () => {
    expect(unitXp(79)).toBe(30);
    expect(unitXp(80)).toBe(40);
    expect(roomXp(false)).toBe(10);
    expect(roomXp(true)).toBe(25);
  });
  it("trần mỗi nguồn mỗi ngày, lý do ghi rõ đã chạm trần", () => {
    const a = { ...emptyDay(), reviews: 80 }; // 160 thô > trần 100
    const [e] = dayLedger("2026-10-20", a);
    expect(e).toMatchObject({ source: "review", xp: DAILY_CAPS.review });
    expect(e.reason).toContain("đạt trần");
    expect(dayLedger("2026-10-20", { ...emptyDay(), reviews: 10 })[0].reason).toBe("Ôn 10 thẻ");
  });
  it("ngày không hoạt động không có khoản nào", () => {
    expect(dayLedger("2026-10-20", emptyDay())).toEqual([]);
  });
  it("sổ cái: mới nhất trước, cộng cả thưởng nhiệm vụ, tổng khớp từng khoản", () => {
    const ledger = buildLedger(
      { "2026-10-19": { ...emptyDay(), reviews: 5 }, "2026-10-20": { ...emptyDay(), dictationGood: 4 } },
      [{ day: "2026-10-20", xp: 15, title: "Ôn 10 thẻ" }],
    );
    expect(ledger.map((e) => e.day)).toEqual(["2026-10-20", "2026-10-20", "2026-10-19"]);
    expect(totalXp(ledger)).toBe(10 + 12 + 15);
    expect(ledger.find((e) => e.source === "quest")?.reason).toBe("Hoàn thành nhiệm vụ: Ôn 10 thẻ");
  });
});
