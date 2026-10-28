import { describe, expect, it } from "vitest";
import { hashString, seededRng } from "./seeded-rng";
import { buildTrial, pickRounds } from "./truth-or-lie";
import { TIMEOUT, emptyPicks, isComplete, mergePicks, parsePicks, resultFor, scoreOf } from "./truth-room";

describe("bộ số ngẫu nhiên có hạt giống", () => {
  it("cùng hạt giống cho cùng dãy, khác hạt giống cho dãy khác, nằm trong [0, 1)", () => {
    const a = seededRng(hashString("ABC234")), b = seededRng(hashString("ABC234")), c = seededRng(hashString("XYZ789"));
    const sa = Array.from({ length: 5 }, a), sb = Array.from({ length: 5 }, b), sc = Array.from({ length: 5 }, c);
    expect(sa).toEqual(sb);
    expect(sa).not.toEqual(sc);
    for (const v of sa) { expect(v).toBeGreaterThanOrEqual(0); expect(v).toBeLessThan(1); }
  });

  it("hai người cùng mã phòng nhận cùng bộ câu (cùng thứ tự vòng và cùng vị trí câu sai)", () => {
    const set = (code: string) => { const rng = seededRng(hashString(code)); return pickRounds(8, rng).map((r) => buildTrial(r, rng)); };
    const x = set("HVJDEM"), y = set("HVJDEM"), z = set("QQQQQQ");
    expect(x.map((t) => t.options.map((o) => o.zh))).toEqual(y.map((t) => t.options.map((o) => o.zh)));
    expect(x.map((t) => t.lieIndex)).toEqual(y.map((t) => t.lieIndex));
    expect(x.map((t) => t.topic)).not.toEqual(z.map((t) => t.topic));
  });
});

describe("phòng Hai thật một giả", () => {
  const rng = seededRng(7);
  const trials = pickRounds(4, rng).map((r) => buildTrial(r, rng));

  it("tính điểm, kiểm tra xong và kết quả", () => {
    const right = trials.map((t) => t.lieIndex);
    expect(scoreOf(trials, right)).toBe(4);
    expect(scoreOf(trials, emptyPicks(4))).toBe(0);
    expect(scoreOf(trials, right.map((p, i) => (i === 0 ? (p + 1) % 3 : p)))).toBe(3);
    expect(isComplete(right, 4)).toBe(true);
    expect(scoreOf(trials, right.map((p, i) => (i === 0 ? TIMEOUT : p)))).toBe(3); // hết giờ không có điểm
    expect(isComplete(right.map((p, i) => (i === 0 ? TIMEOUT : p)), 4)).toBe(true);
    expect(isComplete([0, 1, null, 2], 4)).toBe(false);
    expect(isComplete([0, 1], 4)).toBe(false);
    expect([resultFor(3, 2), resultFor(1, 2), resultFor(2, 2)]).toEqual(["win", "lose", "draw"]);
  });

  it("chỉ nhận tin đáp án đúng dạng", () => {
    expect(parsePicks({ from: "a", picks: [0, null, 2, 1] }, 4)).toEqual({ from: "a", picks: [0, null, 2, 1] });
    expect(parsePicks({ from: "a", picks: [0, 1] }, 4)).toBeNull();
    expect(parsePicks({ from: "a", picks: [0, TIMEOUT, 2, 1] }, 4)).not.toBeNull(); // hết giờ hợp lệ
    expect(parsePicks({ from: "a", picks: [0, 1, 2, 4] }, 4)).toBeNull();
    expect(parsePicks({ from: "a", picks: [0, 1, 2, 1.5] }, 4)).toBeNull();
    expect(parsePicks({ from: "z", picks: [0, 1, 2, 1] }, 4)).toBeNull();
    expect(parsePicks(null, 4)).toBeNull();
  });

  it("hợp đáp án giữ phần đã có", () => {
    expect(mergePicks([1, null, null], [0, 2, null])).toEqual([1, 2, null]);
  });
});
