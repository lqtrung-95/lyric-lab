import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { buildHskRows, cleanMeanings, isHskLevel } from "./build-hsk-rows";
import { buildHskCsv } from "./hsk-csv";

const row = (simplified: string, traditional: string, pinyin: string, meanings: string[], frequency: number | null = null): DictWordRow => ({ simplified, traditional, pinyin, meanings, hsk_level: 3, frequency });
const READINGS = new Map([["學", ["học"]], ["生", ["sinh"]], ["深", ["thâm"]], ["你", ["nhĩ"]]]);

describe("cleanMeanings", () => {
  it("bỏ lượng từ, biến thể và ghi chú; tối đa 3 nghĩa", () => {
    expect(cleanMeanings(["student", "CL:個|个[ge4]", "variant of 學生", "pupil", "learner", "scholar"])).toEqual(["student", "pupil", "learner"]);
  });
  it("nghĩa quá dài (có ví dụ kèm theo) bị cắt ở 80 ký tự", () => {
    const [m] = cleanMeanings(["x".repeat(200)]);
    expect(m).toHaveLength(80);
    expect(m.endsWith("…")).toBe(true);
  });
  it("lọc xong rỗng thì giữ nghĩa gốc đầu tiên để dòng không trống", () => {
    expect(cleanMeanings(["old variant of 深[shen1]"])).toEqual(["old variant of 深[shen1]"]);
  });
});

describe("buildHskRows", () => {
  it("gom theo từ, bỏ mục biến thể (深 trỏ tới chữ 㴱), ghép Hán Việt theo chữ phồn thể", () => {
    const rows = buildHskRows([
      row("深", "㴱", "shēn", ["old variant of 深[shen1]"], 1014),
      row("深", "深", "shēn", ["deep", "profound"], 1014),
      row("学生", "學生", "xué sheng", ["student", "CL:個|个[ge4]"], 200),
    ], READINGS);
    expect(rows.map((r) => r.word)).toEqual(["学生", "深"]);
    expect(rows[0]).toEqual({ word: "学生", pinyin: "xué sheng", sinoViet: "học sinh", meanings: ["student"] });
    expect(rows[1]).toMatchObject({ word: "深", sinoViet: "thâm", meanings: ["deep", "profound"] });
  });
  it("xếp theo độ thường gặp (số nhỏ trước), thiếu số xuống cuối", () => {
    const rows = buildHskRows([row("甲", "甲", "jiǎ", ["a"], null), row("乙", "乙", "yǐ", ["b"], 5), row("丙", "丙", "bǐng", ["c"], 1)], READINGS);
    expect(rows.map((r) => r.word)).toEqual(["丙", "乙", "甲"]);
  });
  it("chữ chưa có trong bảng Hán Việt thì để null, không đoán", () => {
    expect(buildHskRows([row("龘", "龘", "dá", ["x"])], READINGS)[0].sinoViet).toBeNull();
  });
});

describe("isHskLevel", () => {
  it("chỉ cấp 1–6", () => {
    expect([0, 1, 6, 7, 3.5].map(isHskLevel)).toEqual([false, true, true, false, false]);
  });
});

describe("buildHskCsv", () => {
  it("có dòng tiêu đề, nghĩa ngăn bằng '; ' và ô chứa dấu phẩy hoặc nháy được bọc nháy kép", () => {
    const csv = buildHskCsv([{ word: "好", pinyin: "hǎo", sinoViet: "hảo", meanings: ["good", "well, fine"] }, { word: "龘", pinyin: "dá", sinoViet: null, meanings: ['say "dragon"'] }]);
    expect(csv.split("\r\n")).toEqual(["Từ,Pinyin,Hán Việt,Nghĩa", '好,hǎo,hảo,"good; well, fine"', '龘,dá,,"say ""dragon"""']);
  });
});
