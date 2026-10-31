import { describe, expect, it } from "vitest";
import { cleanRelationWords, rawRelationsSchema } from "./word-relations";

describe("cleanRelationWords", () => {
  it("bỏ trùng, chính từ đang xét, không phải chữ Hán; giữ thứ tự", () => {
    const r = cleanRelationWords({ synonyms: ["凶猛", "凶猛", "厉害", "terrible", "猛烈", "ok吗"], antonyms: ["温和", "猛烈", "平庸"] }, "厉害");
    expect(r.synonyms).toEqual(["凶猛", "猛烈"]);
    expect(r.antonyms).toEqual(["温和", "平庸"]);
  });
  it("rỗng thì rỗng", () => { expect(cleanRelationWords({ synonyms: [], antonyms: [] }, "好")).toEqual({ synonyms: [], antonyms: [] }); });
});

describe("rawRelationsSchema", () => {
  it("nhận danh sách thiếu trường và từ quá dài bị loại bằng lỗi", () => {
    expect(rawRelationsSchema.parse({ synonyms: ["好"] })).toEqual({ synonyms: ["好"], antonyms: [] });
    expect(() => rawRelationsSchema.parse({ synonyms: ["一二三四五六七八九"] })).toThrow();
  });
});
