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

const MIN = 60_000;
const delay = (next: { due: string }, from: Date) => Date.parse(next.due) - from.getTime();

describe("gradeCard (tham số chuẩn như Anki)", () => {
  it("thẻ mới chấm lần đầu: Quên 1 phút, Khó 6 phút, Được 10 phút (đang học); Dễ tốt nghiệp sang lịch theo ngày", () => {
    const first = (r: 1 | 2 | 3 | 4) => gradeCard(newCardFields(NOW), r, NOW).next;
    expect([delay(first(Rating.Again), NOW), delay(first(Rating.Hard), NOW), delay(first(Rating.Good), NOW)]).toEqual([1 * MIN, 6 * MIN, 10 * MIN]);
    for (const r of [Rating.Again, Rating.Hard, Rating.Good] as const) expect(first(r).state).toBe(1); // Learning
    const easy = first(Rating.Easy);
    expect(easy.state).toBe(2); // Review
    expect(delay(easy, NOW) / DAY).toBeGreaterThanOrEqual(5);
    expect(delay(easy, NOW) / DAY).toBeLessThanOrEqual(12);
  });

  it("log ghi trạng thái TRƯỚC khi chấm", () => {
    const { next, log } = gradeCard(newCardFields(NOW), Rating.Good, NOW);
    expect(next.reps).toBe(1);
    expect(log).toMatchObject({ rating: 3, state: 0, stability: 0, reviewed_at: NOW.toISOString() });
  });

  it("chấm Được hai lần: hết bước học, sang Review với khoảng từ 1 ngày trở lên; sau đó giãn dần", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    card = gradeCard(card, Rating.Good, t).next;
    t = new Date(card.due);
    card = gradeCard(card, Rating.Good, t).next;
    expect(card.state).toBe(2);
    const gaps = [delay(card, t) / DAY];
    for (let i = 0; i < 5; i++) {
      t = new Date(card.due);
      card = gradeCard(card, Rating.Good, t).next;
      gaps.push(delay(card, t) / DAY);
    }
    expect(gaps[0]).toBeGreaterThanOrEqual(1);
    expect(gaps[gaps.length - 1]).toBeGreaterThan(gaps[0] * 5);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(36500);
  });

  it("khoảng ôn kế dài hơn khi nhớ tốt hơn (Dễ > Được > Khó > Quên) với thẻ đang ôn", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    for (let i = 0; i < 4; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      t = new Date(Math.max(Date.parse(card.due), t.getTime()));
    }
    expect(card.state).toBe(2);
    const due = (r: 1 | 2 | 3 | 4) => Date.parse(gradeCard(card, r, t).next.due);
    expect(due(Rating.Easy)).toBeGreaterThan(due(Rating.Good));
    expect(due(Rating.Good)).toBeGreaterThan(due(Rating.Hard));
    expect(due(Rating.Hard)).toBeGreaterThan(due(Rating.Again));
  });

  it("quên thẻ đang ôn: tăng lapses, vào học lại và quay lại sau 10 phút (trong cùng buổi)", () => {
    let card = newCardFields(NOW);
    let t = NOW;
    for (let i = 0; i < 4; i++) {
      card = gradeCard(card, Rating.Good, t).next;
      t = new Date(Math.max(Date.parse(card.due), t.getTime()));
    }
    const lapsed = gradeCard(card, Rating.Again, t).next;
    expect(lapsed.lapses).toBe(card.lapses + 1);
    expect(lapsed.state).toBe(3); // Relearning
    expect(delay(lapsed, t)).toBe(10 * MIN);
  });

  it("toCard/fromCard là nghịch đảo", () => {
    const f = gradeCard(newCardFields(NOW), Rating.Good, NOW).next;
    expect(fromCard(toCard(f))).toEqual(f);
  });
});

describe("previewIntervals", () => {
  it("thẻ mới: nhãn ba nút đầu là 1 phút, 6 phút, 10 phút; nút Dễ tính bằng ngày", () => {
    const labels = previewIntervals(newCardFields(NOW), NOW);
    expect([labels[1], labels[2], labels[3]]).toEqual(["1 phút", "6 phút", "10 phút"]);
    expect(labels[4]).toMatch(/ngày$/);
  });

  it("nhãn các nút học khớp lịch thật khi chấm", () => {
    const card = newCardFields(NOW);
    const labels = previewIntervals(card, NOW);
    expect(labels[Rating.Good]).toBe(formatInterval(delay(gradeCard(card, Rating.Good, NOW).next, NOW)));
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
