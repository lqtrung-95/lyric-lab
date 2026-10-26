import { describe, expect, it } from "vitest";
import { parseDecomposition } from "./hanzi-structure";
import { parseHanziDictionary } from "./parse-hanzi-dictionary";

// Dòng mẫu tự viết đúng định dạng của dictionary.txt (không chép dữ liệu thật vào repo).
const SAMPLE = [
  '{"character":"明","definition":"bright","pinyin":["míng"],"decomposition":"⿰日月","etymology":{"type":"ideographic","hint":"sun and moon"},"radical":"日"}',
  '{"character":"河","definition":"river","pinyin":["hé"],"decomposition":"⿰氵可","etymology":{"type":"pictophonetic","phonetic":"可","semantic":"氵","hint":"water"},"radical":"水"}',
  '{"character":"？？","radical":"x"}',
  '{"character":"丶","definition":"dot","decomposition":"？","radical":"丶"}',
  "không phải json",
  "",
].join("\n");

describe("parseHanziDictionary", () => {
  const rows = parseHanziDictionary(SAMPLE);
  it("đọc bộ thủ, cấu tạo, nguồn gốc và nghĩa; bỏ dòng hỏng hoặc không phải một chữ", () => {
    expect(rows.map((r) => r.hanzi)).toEqual(["明", "河", "丶"]);
    expect(rows[1]).toMatchObject({ radical: "水", decomposition: "⿰氵可", definition: "river", etymology: { type: "pictophonetic", phonetic: "可", semantic: "氵" } });
  });
  it("cấu tạo không nhận ra (？) thì null, không có etymology thì null", () => {
    expect(rows[2]).toMatchObject({ decomposition: null, etymology: null });
  });
});

describe("parseDecomposition", () => {
  it("lấy kiểu sắp xếp ngoài cùng và các thành phần theo thứ tự", () => {
    expect(parseDecomposition("⿰日月")).toEqual({ layout: "⿰", layoutLabel: "trái – phải", components: ["日", "月"] });
  });
  it("làm phẳng IDS lồng nhau, bỏ ？", () => {
    expect(parseDecomposition("⿱爫⿻冖友").components).toEqual(["爫", "冖", "友"]);
    expect(parseDecomposition("⿱丶？").components).toEqual(["丶"]);
  });
  it("null thì rỗng", () => {
    expect(parseDecomposition(null).components).toEqual([]);
  });
});
