import { describe, expect, it } from "vitest";
import { parseUnihanVietnamese } from "./parse-unihan-vietnamese";

describe("parseUnihanVietnamese", () => {
  it("đọc chữ và các âm, bỏ trường khác", () => {
    const m = parseUnihanVietnamese("# c\nU+6674\tkVietnamese\ttạnh\nU+884C\tkVietnamese\thành hạnh\nU+6674\tkMandarin\tqíng\n");
    expect(m.get("晴")).toEqual(["tạnh"]);
    expect(m.get("行")).toEqual(["hành", "hạnh"]);
    expect(m.size).toBe(2);
  });
});
