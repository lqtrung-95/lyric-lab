import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildGlossIndex } from "./gloss-search";
import { searchDictionary, type DictSearchPort } from "./search-dictionary";
import { buildSinoVietIndex } from "./sino-viet-search";

const r = (simplified: string, traditional: string, pinyin: string, meanings: string[], hsk: number | null, frequency: number | null): DictWordRow =>
  ({ simplified, traditional, pinyin, meanings, hsk_level: hsk, frequency });
const DATA = [
  r("爱", "愛", "ài", ["to love; to be fond of"], 1, 130),
  r("爱情", "愛情", "ài qíng", ["romance; love"], 2, 1164),
  r("城市", "城市", "chéng shì", ["city"], 2, 900),
  r("喜欢", "喜歡", "xǐ huan", ["to like"], 1, 139),
];
const plain = (p: string) => p.normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(/\s/g, "");

const port: DictSearchPort = {
  byHan: async (s, t) => DATA.filter((d) => d.simplified.includes(s) || d.traditional.includes(t)),
  byPinyinPlain: async (q) => DATA.filter((d) => plain(d.pinyin).startsWith(q)),
  byEnglish: async (q) => DATA.filter((d) => d.meanings.join(" ").includes(q)),
  bySimplified: async (terms) => DATA.filter((d) => terms.includes(d.simplified)),
  byTraditional: async (terms) => DATA.filter((d) => terms.includes(d.traditional)),
};
const sinoViet = buildSinoVietIndex([
  { hanzi: "城", readings: ["thành"] }, { hanzi: "市", readings: ["thị"] }, { hanzi: "愛", readings: ["ái"] }, { hanzi: "情", readings: ["tình"] },
]);
const glosses = buildGlossIndex({ 爱: "yêu, thích", 喜欢: "thích", 爱情: "thành thị" });
const deps = { port, sinoViet, glosses };
const first = async (q: string) => (await searchDictionary(q, 10, deps)).map((x) => x.simplified);

describe("searchDictionary", () => {
  it("chữ phồn thể tìm ra mục giản thể, kèm Hán Việt và nghĩa Việt", async () => {
    const [top] = await searchDictionary("愛", 10, deps);
    expect(top).toMatchObject({ simplified: "爱", match: "exact", sinoViet: "ái", gloss: "yêu, thích" });
  });
  it("pinyin không dấu, không khoảng trắng", async () => {
    expect((await first("xihuan"))[0]).toBe("喜欢");
    expect((await first("chengshi"))[0]).toBe("城市");
  });
  it("âm Hán Việt (có hoặc không dấu)", async () => {
    expect((await first("thành thị"))[0]).toBe("城市");
    expect((await first("thanh thi"))[0]).toBe("城市");
  });
  it("Hán Việt nhiều âm tiết khớp đúng xếp trên nghĩa trùng văn bản", async () => {
    expect((await first("thanh thi"))[0]).toBe("城市");
  });
  it("nghĩa tiếng Việt đã duyệt, không dấu", async () => {
    expect(await first("yeu")).toContain("爱");
  });
  it("nghĩa tiếng Anh", async () => {
    expect((await first("city"))[0]).toBe("城市");
  });
  it("một nguồn lỗi không làm hỏng cả lần tìm", async () => {
    const broken = { ...deps, port: { ...port, byEnglish: async () => { throw new Error("db"); } } };
    expect((await searchDictionary("xihuan", 10, broken))[0].simplified).toBe("喜欢");
  });
  it("truy vấn rỗng trả rỗng", async () => {
    expect(await first("  ")).toEqual([]);
  });
});
