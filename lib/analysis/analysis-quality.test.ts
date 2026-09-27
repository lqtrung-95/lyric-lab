import { describe, expect, it } from "vitest";
import { assessAnalysisQuality } from "./analysis-quality";

const line = (text: string) => ({ text }) as never;
const vocab = (n: number) => Array.from({ length: n }, () => ({ type: "vocab" }) as never);
const zh = Array.from({ length: 10 }, () => line("我们一起走"));

describe("assessAnalysisQuality", () => {
  it("bài đủ dòng, chữ Hán và từ vựng: không có vấn đề", () => {
    expect(assessAnalysisQuality({ lines: zh, items: vocab(8) })).toEqual([]);
  });
  it("quá ít dòng", () => {
    expect(assessAnalysisQuality({ lines: zh.slice(0, 3), items: vocab(8) })).toContain("too_short");
  });
  it("lời chủ yếu không phải chữ Hán (bài tiếng Anh/Việt)", () => {
    const en = Array.from({ length: 10 }, () => line("hello my darling"));
    expect(assessAnalysisQuality({ lines: [...en, ...zh.slice(0, 2)], items: vocab(8) })).toContain("not_chinese");
  });
  it("ít từ vựng; ngữ pháp không được tính", () => {
    const items = [...vocab(2), { type: "grammar" } as never, { type: "grammar" } as never, { type: "grammar" } as never];
    expect(assessAnalysisQuality({ lines: zh, items })).toContain("too_few_items");
  });
});
