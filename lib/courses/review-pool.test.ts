import { describe, expect, it } from "vitest";
import { pickReviewTerms, type ReviewSource } from "./review-pool";

const seeded = (seed = 1) => () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };

describe("pickReviewTerms", () => {
  const sources: ReviewSource[] = [
    { terms: ["a1", "a2", "a3"], glosses: { a1: "A1" } },
    { terms: ["b1", "b2"], glosses: { b2: "B2" } },
    { terms: ["c1", "c2", "c3", "c4"] },
  ];
  it("xoay vòng để chặng nào cũng có từ, không trùng, đúng số lượng", () => {
    const { terms } = pickReviewTerms(sources, 3, seeded());
    expect(terms).toHaveLength(3);
    expect(new Set(terms.map((t) => t[0]))).toEqual(new Set(["a", "b", "c"]));
  });
  it("hết từ thì trả ít hơn yêu cầu; từ trùng giữa các chặng chỉ lấy một lần", () => {
    expect(pickReviewTerms(sources, 50, seeded()).terms).toHaveLength(9);
    expect(pickReviewTerms([{ terms: ["x"] }, { terms: ["x", "y"] }], 10, seeded()).terms.sort()).toEqual(["x", "y"]);
  });
  it("từ ưu tiên (hay sai) vào đề trước, chỉ nếu thuộc chặng nguồn, tối đa nửa đề", () => {
    const { terms } = pickReviewTerms(sources, 4, seeded(), ["c4", "zzz", "b1", "a3"]);
    expect(terms.slice(0, 2)).toEqual(["c4", "b1"]);
    expect(terms).not.toContain("zzz");
    expect(terms).toHaveLength(4);
  });
  it("chỉ trả nghĩa của các từ được chọn", () => {
    const { terms, glosses } = pickReviewTerms(sources, 9, seeded());
    expect(terms).toContain("a1");
    expect(glosses).toEqual({ a1: "A1", b2: "B2" });
  });
});
