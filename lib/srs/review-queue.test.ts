import { describe, expect, it } from "vitest";
import { buildReviewQueue, countDueToday, requeueAfterGrade, type QueueCard } from "./review-queue";

const NOW = new Date("2026-03-10T08:00:00Z");
const at = (mins: number) => new Date(NOW.getTime() + mins * 60_000).toISOString();
const card = (key: string, state: number, dueMin: number, createdMin = 0): QueueCard => ({
  item_key: key, state, due: at(dueMin), created_at: at(createdMin - 1000),
});
const keys = (cs: QueueCard[]) => cs.map((c) => c.item_key);

describe("buildReviewQueue", () => {
  it("thẻ đến hạn trước (cũ nhất trước), rồi tới thẻ mới; thẻ chưa đến hạn không vào", () => {
    const cards = [card("later", 2, 60), card("d2", 2, -10), card("d1", 2, -300), card("n1", 0, 0, 1), card("n0", 0, 0, 0)];
    expect(keys(buildReviewQueue({ cards, now: NOW, newPerDay: 15, newStartedToday: 0 }))).toEqual(["d1", "d2", "n0", "n1"]);
  });

  it("thẻ mới bị giới hạn theo hạn mức còn lại trong ngày, thẻ đến hạn thì không", () => {
    const cards = [card("d", 2, -1), card("n0", 0, 0, 0), card("n1", 0, 0, 1), card("n2", 0, 0, 2)];
    expect(keys(buildReviewQueue({ cards, now: NOW, newPerDay: 2, newStartedToday: 1 }))).toEqual(["d", "n0"]);
  });

  it("đã dùng hết hạn mức hôm nay: chỉ còn thẻ đến hạn; hạn mức 0 cũng vậy", () => {
    const cards = [card("d", 2, -1), card("n0", 0, 0)];
    expect(keys(buildReviewQueue({ cards, now: NOW, newPerDay: 15, newStartedToday: 15 }))).toEqual(["d"]);
    expect(keys(buildReviewQueue({ cards, now: NOW, newPerDay: 0, newStartedToday: 0 }))).toEqual(["d"]);
  });

  it("tràn hạn mức (đã học nhiều hơn hạn mức sau khi giảm cài đặt) không sinh số âm", () => {
    expect(buildReviewQueue({ cards: [card("n", 0, 0)], now: NOW, newPerDay: 5, newStartedToday: 9 })).toEqual([]);
  });

  it("thẻ đang học lại đến hạn đúng lúc đó thì vào hàng đợi; sớm 1 phút thì chưa", () => {
    expect(keys(buildReviewQueue({ cards: [card("a", 3, 0), card("b", 1, 1)], now: NOW, newPerDay: 0, newStartedToday: 0 }))).toEqual(["a"]);
  });

  it("countDueToday khớp độ dài hàng đợi", () => {
    const input = { cards: [card("d", 2, -1), card("n", 0, 0)], now: NOW, newPerDay: 15, newStartedToday: 0 };
    expect(countDueToday(input)).toBe(2);
  });
});

describe("requeueAfterGrade", () => {
  const rest = ["a", "b", "c", "d", "e", "f"].map((k) => ({ k, due: at(-5) }));

  it("thẻ hẹn lại trong vài phút quay lại sau 4 thẻ", () => {
    const out = requeueAfterGrade(rest, { k: "x", due: at(1) }, NOW);
    expect(out.map((c) => c.k)).toEqual(["a", "b", "c", "d", "x", "e", "f"]);
  });

  it("hàng đợi ngắn thì thẻ vào cuối", () => {
    expect(requeueAfterGrade(rest.slice(0, 2), { k: "x", due: at(10) }, NOW).map((c) => c.k)).toEqual(["a", "b", "x"]);
  });

  it("thẻ hẹn từ 1 ngày trở lên rời khỏi buổi học", () => {
    expect(requeueAfterGrade(rest, { k: "x", due: at(24 * 60) }, NOW)).toBe(rest);
  });
});
