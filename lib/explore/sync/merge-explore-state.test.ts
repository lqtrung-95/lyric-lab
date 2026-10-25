import { describe, expect, it } from "vitest";
import { emptyProgress, parseProgress } from "../explore-progress";
import { emptyStory, parseStory } from "../story/story-state";
import { isProgressEmpty, isStoryEmpty, mergeProgress, mergeStory } from "./merge-explore-state";

describe("gộp tiến độ Khám phá giữa máy và tài khoản", () => {
  it("hợp các từ và gộp từ trùng theo mốc sớm/muộn, số lớn nhất", () => {
    const a = { terms: { "phong:bed": { discoveredAt: 10, lastSeenAt: 50, correct: 2, wrong: 1 } } };
    const b = { terms: { "phong:bed": { discoveredAt: 5, lastSeenAt: 40, correct: 3, wrong: 0 }, "cho:fish": { discoveredAt: 7, lastSeenAt: 7, correct: 0, wrong: 0 } } };
    const m = mergeProgress(a, b);
    expect(m.terms["phong:bed"]).toEqual({ discoveredAt: 5, lastSeenAt: 50, correct: 3, wrong: 1 });
    expect(Object.keys(m.terms).sort()).toEqual(["cho:fish", "phong:bed"]);
    expect(isProgressEmpty(emptyProgress())).toBe(true);
  });

  it("gộp với tiến độ rỗng giữ nguyên bản kia", () => {
    const a = { terms: { "phong:bed": { discoveredAt: 1, lastSeenAt: 2, correct: 0, wrong: 0 } } };
    expect(mergeProgress(a, emptyProgress())).toEqual(a);
    expect(mergeProgress(emptyProgress(), a)).toEqual(a);
  });

  it("cốt truyện: hợp cờ, manh mối, giữ bộ đếm lớn hơn, scored nếu một bên đã nhận", () => {
    const a = { flags: ["met:chef", "clue:receipt"], clues: ["receipt"], checks: { right: 1, total: 2 }, scored: false };
    const b = { flags: ["met:cat"], clues: ["price_note"], checks: { right: 3, total: 4 }, scored: true };
    const m = mergeStory(a, b);
    expect(m.flags.sort()).toEqual(["clue:receipt", "met:cat", "met:chef"]);
    expect(m.clues.sort()).toEqual(["price_note", "receipt"]);
    expect(m.checks).toEqual({ right: 3, total: 4 });
    expect(m.scored).toBe(true);
    expect(isStoryEmpty(emptyStory())).toBe(true);
    expect(isStoryEmpty(m)).toBe(false);
  });

  it("dữ liệu từ tài khoản hỏng thì thành tiến độ rỗng, không làm vỡ", () => {
    expect(parseProgress(null)).toEqual(emptyProgress());
    expect(parseProgress({ terms: { x: "bậy", "phong:a": { correct: "z" } } }).terms).toEqual({ "phong:a": { discoveredAt: 0, lastSeenAt: 0, correct: 0, wrong: 0 } });
    expect(parseStory({ flags: 5 })).toEqual(emptyStory());
  });
});
