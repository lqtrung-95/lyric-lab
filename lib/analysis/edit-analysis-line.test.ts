import { describe, expect, it } from "vitest";
import type { PreviewItem, SongAnalysis } from "./analysis-types";
import { applyLineEdit } from "./edit-analysis-line";

const vocab = (id: string, term: string, lines: number[]): PreviewItem => ({
  id, type: "vocab", term, level: 3, meaningInContext: "x", priority: 1, occurrences: lines.map((l) => ({ lineIndex: l, start: l * 10 })),
});
const grammar = (id: string, lines: number[]): PreviewItem => ({
  id, type: "grammar", term: "一直+就", level: 3, meaningInContext: "x", priority: 1, occurrences: lines.map((l) => ({ lineIndex: l, start: l * 10, ranges: [[0, 2]] as [number, number][] })),
});

const analysis = (): SongAnalysis => ({
  videoId: "aaaaaaaaaaa", lyricsSource: "lrclib", summary: "", moods: [], promptVersion: "v", model: "m",
  lines: [
    { index: 0, text: "我爱你", start: 0, end: 5, pinyin: "wǒ ài nǐ", translation: "Anh yêu em", tokens: [{ text: "我" }, { text: "爱", itemId: "vocab:0" }, { text: "你" }] },
    { index: 1, text: "永远不变", start: 10, end: 15, pinyin: "yǒng yuǎn bù biàn", translation: "Mãi không đổi", tokens: [{ text: "永远", itemId: "vocab:1" }, { text: "不变" }] },
  ],
  items: [vocab("vocab:0", "爱", [0]), vocab("vocab:1", "永远", [1]), grammar("grammar:0", [1])],
});

describe("applyLineEdit", () => {
  it("sửa chữ, pinyin và token của đúng một dòng, giữ mốc thời gian và bản dịch", () => {
    const out = applyLineEdit(analysis(), { lineIndex: 1, text: "永远爱你", tokens: [{ text: "永远", simplified: "永远" }, { text: "爱", simplified: "爱" }, { text: "你", simplified: "你" }], pinyin: "yǒng yuǎn ài nǐ" })!;
    const line = out.lines[1];
    expect(line).toMatchObject({ index: 1, text: "永远爱你", pinyin: "yǒng yuǎn ài nǐ", start: 10, end: 15, translation: "Mãi không đổi" });
    expect(line.tokens).toEqual([{ text: "永远", itemId: "vocab:1" }, { text: "爱", itemId: "vocab:0" }, { text: "你", itemId: undefined }]);
    expect(out.lines[0]).toEqual(analysis().lines[0]);
  });

  it("từ vựng khớp token mới được thêm lần xuất hiện; ngữ pháp ở dòng đó bị bỏ", () => {
    const out = applyLineEdit(analysis(), { lineIndex: 1, text: "永远爱你", tokens: [{ text: "永远", simplified: "永远" }, { text: "爱", simplified: "爱" }, { text: "你", simplified: "你" }], pinyin: "x" })!;
    expect(out.items.find((i) => i.id === "vocab:0")!.occurrences.map((o) => o.lineIndex)).toEqual([0, 1]);
    expect(out.items.find((i) => i.id === "grammar:0")).toBeUndefined(); // chỉ có ở dòng 1 nên không còn lần xuất hiện nào
  });

  it("mục chỉ xuất hiện ở dòng đã sửa và không còn khớp thì bị xóa", () => {
    const out = applyLineEdit(analysis(), { lineIndex: 0, text: "我想你", tokens: [{ text: "我", simplified: "我" }, { text: "想", simplified: "想" }, { text: "你", simplified: "你" }], pinyin: "wǒ xiǎng nǐ" })!;
    expect(out.items.find((i) => i.id === "vocab:0")).toBeUndefined();
    expect(out.items.find((i) => i.id === "vocab:1")).toBeDefined();
  });

  it("đổi bản dịch khi được truyền, giữ nguyên khi không", () => {
    const tokens = [{ text: "我", simplified: "我" }];
    expect(applyLineEdit(analysis(), { lineIndex: 0, text: "我", tokens, pinyin: "wǒ", translation: "Tôi" })!.lines[0].translation).toBe("Tôi");
    expect(applyLineEdit(analysis(), { lineIndex: 0, text: "我", tokens, pinyin: "wǒ" })!.lines[0].translation).toBe("Anh yêu em");
  });

  it("không có dòng đó thì null và không sửa đầu vào", () => {
    const a = analysis();
    expect(applyLineEdit(a, { lineIndex: 9, text: "x", tokens: [], pinyin: "" })).toBeNull();
    expect(a).toEqual(analysis());
  });
});
