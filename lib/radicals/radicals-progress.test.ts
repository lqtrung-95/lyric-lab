import { describe, expect, it } from "vitest";
import { EMPTY_PROGRESS, mergeRadicalProgress, parseRadicalProgress, recordRadicalAnswer, toggleKnown, topicProgress, weakRadicals } from "./radicals-progress";
import { entriesOfTopic } from "./radicals";

describe("tiến độ bộ thủ", () => {
  it("bật/tắt đã biết, giữ thứ tự", () => {
    let p = toggleKnown(EMPTY_PROGRESS, 85); p = toggleKnown(p, 9);
    expect(p.known).toEqual([9, 85]);
    expect(toggleKnown(p, 9).known).toEqual([85]);
  });
  it("parse bỏ số ngoài 1–214, trùng và rác", () => {
    expect(parseRadicalProgress({ known: [1, 1, 0, 215, "x", 5], stats: { "5": { right: 2, wrong: -1 }, "999": { right: 1 }, a: {} } })).toEqual({ known: [1, 5], stats: { "5": { right: 2, wrong: 0, last: 0 } } });
    expect(parseRadicalProgress(null)).toEqual(EMPTY_PROGRESS);
  });
  it("nhận bộ hay nhầm", () => {
    let p = EMPTY_PROGRESS;
    for (const ok of [false, false, true]) p = recordRadicalAnswer(p, 85, ok, 1);
    for (const ok of [true, true]) p = recordRadicalAnswer(p, 9, ok, 1);
    expect(weakRadicals(p)).toEqual([85]);
  });
  it("tiến độ chủ đề và gộp hai bản", () => {
    const list = entriesOfTopic("nguoi");
    expect(topicProgress({ known: [9, 85], stats: {} }, list)).toEqual({ known: 1, total: list.length });
    const m = mergeRadicalProgress({ known: [1], stats: { "9": { right: 3, wrong: 0, last: 5 } } }, { known: [2], stats: { "9": { right: 1, wrong: 2, last: 9 } } });
    expect(m).toEqual({ known: [1, 2], stats: { "9": { right: 3, wrong: 2, last: 9 } } });
  });
});
