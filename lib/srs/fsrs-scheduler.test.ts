import { describe, expect, it } from "vitest";
import { Rating } from "ts-fsrs";
import { fromCard, gradeCard, newCardFields, previewIntervals, toCard } from "./fsrs-scheduler";
import { formatInterval } from "./interval-label";

const NOW = new Date("2026-03-10T08:00:00Z");
const DAY = 86_400_000;

describe("newCardFields", () => {
  it("thẻ mới ở trạng thái New, chưa ôn lần nào", () => {
    expect(newCardFields(NOW)).toMatchObject({ state: 0, reps: 0, lapses: 0, last_review: null, due: NOW.toISOString() });
  });
});

describe("gradeCard", () => {
  it("chấm Được thẻ mới: sang bước học, hẹn lại vài phút, log ghi trạng thái TRƯỚC khi chấm", () => {
    const { next, log } = gradeCard(newCardFields(NOW), Rating.Good, NOW);
    expect(next.state).toBe(1);
    expect(next.reps).toBe(1);
    expect(Date.parse(next.due) - NOW.getTime()).toBeLessThan(60 * 60_000);
    expect(log).toMatchObject({ rating: 3, state: 0, stability: 0, reviewed_at: NOW.toISOString() });
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

  it("quên thẻ đang ôn: tăng lapses và chuyển sang học lại", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    for (let i = 0; i < 3; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      t = new Date(Math.max(Date.parse(card.due), t.getTime()));
    }
    const lapsed = gradeCard(card, Rating.Again, t).next;
    expect(lapsed.lapses).toBe(card.lapses + 1);
    expect(lapsed.state).toBe(3);
  });

  it("toCard/fromCard là nghịch đảo", () => {
    const f = gradeCard(newCardFields(NOW), Rating.Good, NOW).next;
    expect(fromCard(toCard(f))).toEqual(f);
  });
});

describe("previewIntervals", () => {
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
