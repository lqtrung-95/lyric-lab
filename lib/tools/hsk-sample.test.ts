import { describe, expect, it } from "vitest";
import type { HskRow } from "./build-hsk-rows";
import { DEFAULT_SAMPLE, cleanMeaning, MAX_SAMPLE, MIN_SAMPLE, clampSample, sampleHskWords, toWorksheetLine } from "./hsk-sample";

const row = (word: string, meanings: string[] = ["m"], pinyin = "p"): HskRow => ({ word, pinyin, sinoViet: null, meanings, meaningVi: null });
const rows = [row("你好"), row("谢谢"), row("再见"), row("老师"), row("学生"), row("A型"), row("一"), row("电视机"), row("没有", []), row("好", ["good"], ""), row("工作")];

describe("lấy mẫu từ HSK", () => {
  it("chỉ lấy từ hợp (toàn chữ Hán, ≤ 4 chữ, có pinyin và nghĩa), không trùng và đúng số lượng", () => {
    const out = sampleHskWords(rows, 6, () => 0.5);
    expect(out).toHaveLength(6);
    expect(new Set(out.map((r) => r.word)).size).toBe(6);
    for (const r of out) expect(["A型", "没有", "好"]).not.toContain(r.word);
    expect(sampleHskWords(rows, 100, () => 0.1)).toHaveLength(8); // chỉ có 8 từ hợp
  });

  it("không sửa mảng gốc và các bộ số ngẫu nhiên khác nhau cho thứ tự khác nhau", () => {
    const copy = [...rows];
    const a = sampleHskWords(rows, 5, () => 0).map((r) => r.word);
    const b = sampleHskWords(rows, 5, () => 0.99).map((r) => r.word);
    expect(rows).toEqual(copy);
    expect(a).not.toEqual(b);
  });

  it("bỏ từ chỉ có ghi chú thô của từ điển, chọn nghĩa sạch ngắn đầu tiên", () => {
    expect(cleanMeaning(row("线", ["variant of 線|线[xian4]", "thread"]))).toBe("thread");
    expect(cleanMeaning(row("线", ["variant of 線|线[xian4]"]))).toBeNull();
    expect(cleanMeaning(row("长", ["a very very long explanation that goes past forty characters"]))).toBeNull();
    expect(sampleHskWords([row("线", ["see 線|线[xian4]"]), row("水", ["water"])], 5).map((r) => r.word)).toEqual(["水"]);
  });

  it("giới hạn số từ và dựng dòng cho tờ bài tập", () => {
    expect(clampSample(3)).toBe(MIN_SAMPLE);
    expect(clampSample(99)).toBe(MAX_SAMPLE);
    expect(clampSample("abc")).toBe(DEFAULT_SAMPLE);
    expect(toWorksheetLine(row("你好", ["hello, hi (greeting)"]))).toBe("你好, hello / hi (greeting)");
  });
});
