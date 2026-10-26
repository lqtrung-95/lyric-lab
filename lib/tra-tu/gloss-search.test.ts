import { describe, expect, it } from "vitest";
import { buildGlossIndex, searchGlosses } from "./gloss-search";

const index = buildGlossIndex({ 爱: "yêu, thích", 爱情: "tình yêu", 喜欢: "thích, ưa", 可爱: "dễ thương, đáng yêu" });

describe("searchGlosses", () => {
  it("khớp trọn một ý trước, rồi khớp theo từ", () => {
    expect(searchGlosses(index, "yeu", 10)).toEqual([{ term: "爱", strength: 3 }, { term: "爱情", strength: 2 }, { term: "可爱", strength: 2 }]);
  });
  it("tìm không dấu ra nghĩa có dấu", () => {
    expect(searchGlosses(index, "thich", 10).map((h) => h.term)).toEqual(["爱", "喜欢"]);
  });
  it("truy vấn 1 ký tự quá mơ hồ thì bỏ qua", () => {
    expect(searchGlosses(index, "y", 10)).toEqual([]);
  });
});
