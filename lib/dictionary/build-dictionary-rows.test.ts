import { describe, expect, it } from "vitest";
import { buildDictWordRows } from "./build-dictionary-rows";

const cedict = (simplified: string, pinyin: string, meanings = ["m"]) => ({ traditional: simplified, simplified, pinyin, meanings });
const hsk = (simplified: string, pinyin: string, level: number) => ({ simplified, traditional: simplified, pinyin, meanings: ["hsk"], level, frequency: 50 });

describe("buildDictWordRows", () => {
  it("gắn cấp HSK vào mục CEDICT cùng pinyin (từ nhiều âm)", () => {
    const rows = buildDictWordRows([cedict("行", "háng"), cedict("行", "xíng")], [hsk("行", "xíng", 2)]);
    expect(rows.find((r) => r.pinyin === "xíng")?.hsk_level).toBe(2);
    expect(rows.find((r) => r.pinyin === "háng")?.hsk_level).toBeNull();
  });

  it("pinyin HSK không khớp thì gắn vào mục đầu tiên", () => {
    const rows = buildDictWordRows([cedict("城市", "chéng shì")], [hsk("城市", "chengshi", 3)]);
    expect(rows[0].hsk_level).toBe(3);
  });

  it("từ HSK không có trong CEDICT được thêm riêng", () => {
    const rows = buildDictWordRows([], [hsk("新词", "xīn cí", 7)]);
    expect(rows).toEqual([{ simplified: "新词", traditional: "新词", pinyin: "xīn cí", meanings: ["hsk"], hsk_level: 7, frequency: 50 }]);
  });

  it("gộp nghĩa của các dòng CEDICT trùng khóa, không có bản sao", () => {
    const rows = buildDictWordRows([cedict("好", "hǎo", ["good"]), cedict("好", "hǎo", ["fine"])], []);
    expect(rows).toHaveLength(1);
    expect(rows[0].meanings).toEqual(["good", "fine"]);
  });
});
