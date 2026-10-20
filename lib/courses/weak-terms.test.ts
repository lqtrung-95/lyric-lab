import { describe, expect, it } from "vitest";
import { updateWeakTerms } from "./weak-terms";

describe("updateWeakTerms", () => {
  it("từ sai lên đầu, từ đúng bị bỏ, không trùng", () => {
    expect(updateWeakTerms(["a", "b", "c"], ["d", "b"], ["c"])).toEqual(["d", "b", "a"]);
  });
  it("giới hạn số từ theo dõi", () => {
    const many = Array.from({ length: 200 }, (_, i) => `w${i}`);
    expect(updateWeakTerms(many, ["x"], [])).toHaveLength(120);
    expect(updateWeakTerms(many, ["x"], [])[0]).toBe("x");
  });
});
