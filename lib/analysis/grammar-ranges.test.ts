import { describe, expect, it } from "vitest";
import { grammarCharRanges } from "./grammar-ranges";

describe("grammarCharRanges", () => {
  it("tìm các cụm chữ Hán theo thứ tự", () => {
    expect(grammarCharRanges("从来没 + V + 过", "我从来没想过会离开")).toEqual([[1, 4], [5, 6]]);
  });
  it("không khớp hoặc không có chữ Hán → rỗng", () => {
    expect(grammarCharRanges("就算 … 也 …", "我从来没想过会离开")).toEqual([]);
    expect(grammarCharRanges("A + B", "我从来没想过会离开")).toEqual([]);
  });
});
