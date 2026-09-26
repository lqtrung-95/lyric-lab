import { describe, expect, it } from "vitest";
import { Rating } from "ts-fsrs";
import { FIRST_REVIEW_DAYS, fromCard, gradeCard, newCardFields, previewIntervals, toCard } from "./fsrs-scheduler";
import { formatInterval } from "./interval-label";

const NOW = new Date("2026-03-10T08:00:00Z");
const DAY = 86_400_000;

describe("newCardFields", () => {
  it("thẻ mới ở trạng thái New, chưa ôn lần nào", () => {
    expect(newCardFields(NOW)).toMatchObject({ state: 0, reps: 0, lapses: 0, last_review: null, due: NOW.toISOString() });
  });
});

describe("gradeCard", () => {
  it("lần chấm đầu của thẻ mới cho đúng 1 / 2 / 5 / 10 ngày (Quên / Khó / Được / Dễ), không có bước học tính bằng phút", () => {
    const days = ([Rating.Again, Rating.Hard, Rating.Good, Rating.Easy] as const).map((r) => {
      const { next } = gradeCard(newCardFields(NOW), r, NOW);
      expect(next.state).toBe(2); // vào thẳng trạng thái Review
      return (Date.parse(next.due) - NOW.getTime()) / DAY;
    });
    expect(days).toEqual([FIRST_REVIEW_DAYS.again, FIRST_REVIEW_DAYS.hard, FIRST_REVIEW_DAYS.good, FIRST_REVIEW_DAYS.easy]);
    expect(days).toEqual([1, 2, 5, 10]);
  });

  it("log ghi trạng thái TRƯỚC khi chấm", () => {
    const { next, log } = gradeCard(newCardFields(NOW), Rating.Good, NOW);
    expect(next.reps).toBe(1);
    expect(log).toMatchObject({ rating: 3, state: 0, stability: 0, reviewed_at: NOW.toISOString() });
  });

  it("chấm Được đúng hạn nhiều lần: khoảng ôn giãn dần và không vượt trần 180 ngày", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    const gaps: number[] = [];
    for (let i = 0; i < 6; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      gaps.push((Date.parse(card.due) - t.getTime()) / DAY);
      t = new Date(card.due);
    }
    for (let i = 1; i < gaps.length; i++) expect(gaps[i]).toBeGreaterThanOrEqual(gaps[i - 1]);
    expect(gaps[0]).toBe(5);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(180);
  });

  it("khoảng ôn kế dài hơn khi nhớ tốt hơn (Dễ > Được > Khó > Quên) với thẻ đang ôn", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    for (let i = 0; i < 3; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      t = new Date(Math.max(Date.parse(card.due), t.getTime()));
    }
    expect(card.state).toBe(2);
    const due = (r: 1 | 2 | 3 | 4) => Date.parse(gradeCard(card, r, t).next.due);
    expect(due(Rating.Easy)).toBeGreaterThan(due(Rating.Good));
    expect(due(Rating.Good)).toBeGreaterThan(due(Rating.Hard));
    expect(due(Rating.Hard)).toBeGreaterThan(due(Rating.Again));
  });

  it("quên thẻ đang ôn: tăng lapses và hẹn lại 1 ngày (không học lại trong ngày)", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    for (let i = 0; i < 3; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      t = new Date(Math.max(Date.parse(card.due), t.getTime()));
    }
    const lapsed = gradeCard(card, Rating.Again, t).next;
    expect(lapsed.lapses).toBe(card.lapses + 1);
    expect(lapsed.state).toBe(2); // không có bước học lại tính bằng phút: ở lại trạng thái Review
    expect((Date.parse(lapsed.due) - t.getTime()) / DAY).toBeGreaterThanOrEqual(1);
    expect((Date.parse(lapsed.due) - t.getTime()) / DAY).toBeLessThan(5);
  });

  it("toCard/fromCard là nghịch đảo", () => {
    const f = gradeCard(newCardFields(NOW), Rating.Good, NOW).next;
    expect(fromCard(toCard(f))).toEqual(f);
  });
});

describe("previewIntervals", () => {
  it("thẻ mới: nhãn bốn nút là 1 ngày, 2 ngày, 5 ngày, 10 ngày", () => {
    expect(previewIntervals(newCardFields(NOW), NOW)).toEqual({ 1: "1 ngày", 2: "2 ngày", 3: "5 ngày", 4: "10 ngày" });
  });

  it("khớp với lịch thật khi chấm (không fuzz)", () => {
    const card = newCardFields(NOW);
    const labels = previewIntervals(card, NOW);
    const actual = formatInterval(Date.parse(gradeCard(card, Rating.Easy, NOW).next.due) - NOW.getTime());
    expect(labels[Rating.Easy]).toBe(actual);
    expect(Object.keys(labels)).toHaveLength(4);
  });
});

describe("formatInterval", () => {
  it("chọn đơn vị phù hợp", () => {
    expect(formatInterval(30_000)).toBe("1 phút");
    expect(formatInterval(10 * 60_000)).toBe("10 phút");
    expect(formatInterval(3 * 3_600_000)).toBe("3 giờ");
    expect(formatInterval(DAY)).toBe("1 ngày");
    expect(formatInterval(45 * DAY)).toBe("2 tháng");
    expect(formatInterval(400 * DAY)).toBe("1.1 năm");
  });
});
