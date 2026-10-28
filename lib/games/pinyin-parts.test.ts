import { describe, expect, it } from "vitest";
import { isSolved, parseSyllable, scoreGuess, shareRow, syllablesOf, wordleMarks } from "./pinyin-parts";

describe("parseSyllable", () => {
  it("tách phụ âm đầu, vần, thanh", () => {
    expect(parseSyllable("peng2", null)).toEqual({ initial: "p", final: "eng", tone: 2 });
    expect(parseSyllable("zhong1", null)).toEqual({ initial: "zh", final: "ong", tone: 1 });
    expect(parseSyllable("er4", null)).toEqual({ initial: "", final: "er", tone: 4 });
    expect(parseSyllable("an1", null)).toEqual({ initial: "", final: "an", tone: 1 });
  });
  it("ü: sau j/q/x/y viết u, còn lại v", () => {
    expect(parseSyllable("xue2", null)).toEqual({ initial: "x", final: "ue", tone: 2 });
    expect(parseSyllable("xve2", null)).toEqual({ initial: "x", final: "ue", tone: 2 });
    expect(parseSyllable("nv3", null)).toEqual({ initial: "n", final: "v", tone: 3 });
    expect(parseSyllable("nü3", null)).toEqual({ initial: "n", final: "v", tone: 3 });
  });
  it("bắt buộc có thanh khi defaultTone là null, thanh nhẹ khi có mặc định", () => {
    expect(parseSyllable("ma", null)).toBeNull();
    expect(parseSyllable("ma", 5)).toEqual({ initial: "m", final: "a", tone: 5 });
  });
  it("loại âm tiết không hợp lệ", () => {
    expect(parseSyllable("qqq1", null)).toBeNull();
    expect(parseSyllable("", 5)).toBeNull();
  });
});

describe("syllablesOf", () => {
  it("đọc pinyin có dấu của từ hai âm tiết", () => {
    expect(syllablesOf("péng yǒu")).toEqual([{ initial: "p", final: "eng", tone: 2 }, { initial: "y", final: "ou", tone: 3 }]);
    expect(syllablesOf("xuéxí")).toBeNull(); // dính liền: không tách được thành âm tiết hợp lệ
  });
});

describe("wordleMarks", () => {
  it("xanh, vàng, xám", () => {
    expect(wordleMarks(["a", "b"], ["a", "c"])).toEqual(["hit", "miss"]);
    expect(wordleMarks(["a", "b"], ["b", "a"])).toEqual(["near", "near"]);
  });
  it("không cho vàng quá số lượng có trong đáp án", () => {
    expect(wordleMarks(["a", "b"], ["a", "a"])).toEqual(["hit", "miss"]);
    expect(wordleMarks(["a", "a"], ["b", "a"])).toEqual(["miss", "hit"]);
  });
});

describe("scoreGuess", () => {
  const ans = syllablesOf("péng yǒu")!;
  it("đoán đúng hoàn toàn", () => { expect(isSolved(scoreGuess(ans, ans))).toBe(true); });
  it("không gõ thanh thì ô thanh là chưa biết, và chưa tính là thắng", () => {
    const g = scoreGuess(ans, syllablesOf("péng yǒu")!.map((s) => ({ ...s, tone: 0 })));
    expect(g.tone).toEqual(["unk", "unk"]);
    expect(isSolved(g)).toBe(false);
    expect(shareRow(g)).toBe("🟩🟩⬜ 🟩🟩⬜");
  });
  it("chấm từng nhóm và tạo hàng chia sẻ", () => {
    const g = scoreGuess(ans, syllablesOf("péng yǒu")!.map((s, i) => (i === 1 ? { ...s, tone: 4 } : s)));
    expect(g.tone).toEqual(["hit", "miss"]);
    expect(shareRow(g)).toBe("🟩🟩🟩 🟩🟩⬛");
  });
});
