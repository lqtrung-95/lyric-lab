import { describe, expect, it } from "vitest";
import { pickAdvice, weakCounts } from "./weak-summary";

describe("tổng hợp điểm yếu", () => {
  it("đếm từng nhóm", () => {
    const c = weakCounts({
      hardWords: 3, courseTerms: 2,
      grammar: { ba: { right: 1, wrong: 3, last: 1 }, bi: { right: 5, wrong: 0, last: 1 } },
      radicals: { known: [], stats: { "85": { right: 0, wrong: 2, last: 1 }, "9": { right: 3, wrong: 0, last: 1 } } },
    });
    expect(c).toEqual({ vocab: 3, grammar: 1, radical: 1, course: 2 });
  });
  it("gợi ý nhóm nhiều nhất; hòa thì theo thứ tự; không có thì null", () => {
    expect(pickAdvice({ vocab: 1, grammar: 4, radical: 2, course: 0 })?.kind).toBe("grammar");
    expect(pickAdvice({ vocab: 2, grammar: 2, radical: 0, course: 0 })?.kind).toBe("vocab");
    expect(pickAdvice({ vocab: 0, grammar: 0, radical: 0, course: 0 })).toBeNull();
    expect(pickAdvice({ vocab: 0, grammar: 0, radical: 5, course: 1 })?.href).toBe("/radicals/practice?source=weak");
  });
});
