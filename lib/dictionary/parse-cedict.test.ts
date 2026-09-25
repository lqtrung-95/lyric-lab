import { describe, expect, it } from "vitest";
import { parseCedict, parseCedictLine } from "./parse-cedict";

describe("parseCedict", () => {
  it("đọc một dòng và đổi pinyin có dấu", () => {
    expect(parseCedictLine("城市 城市 [cheng2 shi4] /city/town/")).toEqual({
      traditional: "城市", simplified: "城市", pinyin: "chéng shì", meanings: ["city", "town"],
    });
  });

  it("dòng có chữ phồn khác giản", () => {
    const e = parseCedictLine("回憶 回忆 [hui2 yi4] /to recall/memories/");
    expect(e?.traditional).toBe("回憶");
    expect(e?.simplified).toBe("回忆");
  });

  it("bỏ dòng chú thích và dòng sai định dạng", () => {
    expect(parseCedictLine("#! version=1")).toBeNull();
    expect(parseCedictLine("")).toBeNull();
    expect(parseCedictLine("không đúng định dạng")).toBeNull();
  });

  it("parseCedict lọc theo từng dòng", () => {
    expect(parseCedict("# c\n星光 星光 [xing1 guang1] /starlight/\n\n")).toHaveLength(1);
  });
});
