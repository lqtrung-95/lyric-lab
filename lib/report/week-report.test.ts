import { describe, expect, it } from "vitest";
import { buildWeekReport, deltaText, shareSummary } from "./week-report";

const TZ = "Asia/Ho_Chi_Minh";
const now = new Date("2026-10-31T10:00:00+07:00");
const at = (day: string, h = 9) => `${day}T${String(h).padStart(2, "0")}:00:00+07:00`;
const round = (day: string, mode: string, points: number, correct: number, total: number) => ({ played_at: at(day), mode, points, correct, total });

describe("báo cáo tuần", () => {
  const r = buildWeekReport({
    now, timeZone: TZ, totalLearned: 120,
    reviews: [at("2026-10-31"), at("2026-10-31"), at("2026-10-30"), at("2026-10-26"), at("2026-10-22")],
    rounds: [round("2026-10-31", "pinyin", 500, 5, 10), round("2026-10-29", "radical", 300, 3, 10), round("2026-10-28", "pinyin", 200, 2, 5), round("2026-10-20", "match", 100, 4, 4)],
    newCardStamps: [at("2026-10-31"), at("2026-10-25"), at("2026-10-24")],
  });
  it("cửa sổ 7 ngày gồm hôm nay và 7 ngày liền trước", () => {
    expect(r.from).toBe("2026-10-25");
    expect(r.to).toBe("2026-10-31");
    expect(r.bars.map((b) => b.day)).toEqual(["2026-10-25", "2026-10-26", "2026-10-27", "2026-10-28", "2026-10-29", "2026-10-30", "2026-10-31"]);
  });
  it("đếm thẻ, lượt luyện, ngày học trong tuần này và tuần trước", () => {
    expect(r.current).toEqual({ studyDays: 5, cardsReviewed: 4, practiceRounds: 3, answered: 25, correct: 10, points: 1000 });
    expect(r.previous).toEqual({ studyDays: 2, cardsReviewed: 1, practiceRounds: 1, answered: 4, correct: 4, points: 100 });
  });
  it("độ chính xác, chế độ hay luyện, ngày tốt nhất, thẻ mới", () => {
    expect(r.accuracyPct).toBe(40);
    expect(r.topModes[0]).toEqual({ mode: "pinyin", label: "Gõ pinyin", rounds: 2 });
    expect(r.bestDay).toEqual({ day: "2026-10-31", items: 12 });
    expect(r.newCards).toBe(2);
    expect(r.totalLearned).toBe(120);
  });
  it("thanh ngày: ngày không học có 0 mục", () => {
    expect(r.bars.find((b) => b.day === "2026-10-27")).toEqual({ day: "2026-10-27", items: 0, studied: false });
  });
  it("tuần trống: không có độ chính xác hay ngày tốt nhất", () => {
    const e = buildWeekReport({ now, timeZone: TZ, reviews: [], rounds: [], newCardStamps: [], totalLearned: 0 });
    expect(e.accuracyPct).toBeNull();
    expect(e.bestDay).toBeNull();
    expect(e.current.studyDays).toBe(0);
  });
  it("múi giờ quyết định ngày: 23:30 giờ VN vẫn là ngày đó", () => {
    const x = buildWeekReport({ now, timeZone: TZ, reviews: ["2026-10-30T23:30:00+07:00"], rounds: [], newCardStamps: [], totalLearned: 0 });
    expect(x.bars.find((b) => b.day === "2026-10-30")?.items).toBe(1);
  });
});

describe("deltaText và shareSummary", () => {
  it("so với tuần trước", () => {
    expect(deltaText(10, 4)).toBe("+6 so với tuần trước");
    expect(deltaText(3, 5)).toBe("−2 so với tuần trước");
    expect(deltaText(2, 2)).toBe("như tuần trước");
    expect(deltaText(0, 0)).toBeNull();
  });
  it("câu chia sẻ không có dữ liệu cá nhân", () => {
    const r = buildWeekReport({ now, timeZone: TZ, reviews: [at("2026-10-31")], rounds: [round("2026-10-31", "pinyin", 500, 5, 10)], newCardStamps: [], totalLearned: 9 });
    expect(shareSummary(r)).toBe("Tuần qua của mình trên SongHanzi: 1/7 ngày học, 1 thẻ đã ôn, 1 lượt luyện, đúng 50%.");
  });
});
