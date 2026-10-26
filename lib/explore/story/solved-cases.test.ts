import { describe, expect, it } from "vitest";
import { countSolvedCases } from "./solved-cases";

const defs = { a: { difficulty: "easy", solvedFlag: "case:solved" }, b: { difficulty: "hard", solvedFlag: "case:solved" }, c: { difficulty: "hard", solvedFlag: "case:solved" } };

describe("countSolvedCases", () => {
  it("đếm vụ đã giải và riêng vụ khó, bỏ qua vụ chưa giải hoặc không còn trong danh mục", () => {
    const raw = { cases: { a: { flags: ["case:solved"] }, b: { flags: ["case:solved"] }, c: { flags: ["met:x"] }, gone: { flags: ["case:solved"] } } };
    expect(countSolvedCases(raw, defs)).toEqual({ solved: 2, hardSolved: 1 });
  });

  it("dữ liệu rỗng hoặc sai dạng thì là 0", () => {
    expect(countSolvedCases(null, defs)).toEqual({ solved: 0, hardSolved: 0 });
    expect(countSolvedCases({ cases: { a: 5 } }, defs)).toEqual({ solved: 0, hardSolved: 0 });
  });
});
