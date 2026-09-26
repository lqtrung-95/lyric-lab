import { describe, expect, it } from "vitest";
import { parseDiscoverParams } from "./discover-query";

const parse = (q: string) => parseDiscoverParams(new URLSearchParams(q));

describe("parseDiscoverParams", () => {
  it("mặc định: mới nhất, không lọc cấp, không từ khóa, offset 0", () => {
    expect(parse("")).toEqual({ sort: "new", band: null, query: "", offset: 0 });
  });

  it("nhận sort, band và offset hợp lệ", () => {
    expect(parse("sort=popular&band=3-4&offset=24")).toEqual({ sort: "popular", band: [2.5, 4.5], query: "", offset: 24 });
  });

  it("giá trị lạ về mặc định, offset bị kẹp", () => {
    expect(parse("sort=x&band=99&offset=-5").offset).toBe(0);
    expect(parse("sort=x&band=99")).toMatchObject({ sort: "new", band: null });
    expect(parse("offset=999999").offset).toBe(2000);
    expect(parse("offset=abc").offset).toBe(0);
  });

  it("từ khóa bị làm sạch ký tự đặc biệt của ilike và giới hạn độ dài", () => {
    expect(parse("q=%25a_b%5C(c)").query).toBe("a b c");
    expect(parse(`q=${"x".repeat(200)}`).query).toHaveLength(60);
  });
});
