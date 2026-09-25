import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { buildVocabCandidates } from "./build-vocab-candidates";
import { collectHanTerms, tokenizeLyricLines } from "./tokenize-lyric-lines";

// Lời hư cấu 夜车 (docs/design-brief.md mục 6), dạng phồn thể ở dòng 2 để kiểm tra căn chỉnh.
const lines = normalizeLyricLines([
  { text: "窗外的城市慢慢睡了", start: 0, end: 5 },
  { text: "我從來沒想過會離開", start: 5, end: 10 },
  { text: "把回憶放進口袋里", start: 10, end: 15 },
  { text: "城市 yeah-eh", start: 15, end: 20 },
]);
const row = (simplified: string, hsk: number | null, meanings = ["m"]): DictWordRow => ({
  simplified, traditional: simplified, pinyin: "p", meanings, hsk_level: hsk, frequency: null,
});
const dictionary = new Map([
  ["城市", [row("城市", 3)]], ["离开", [row("离开", 2)]], ["回忆", [row("回忆", 5)]], ["口袋", [row("口袋", 4)]],
  ["的", [row("的", 1)]], ["我", [row("我", 1)]], ["睡", [row("睡", 2)]], ["慢慢", [row("慢慢", 4)]],
]);

describe("tokenizeLyricLines", () => {
  const tokenized = tokenizeLyricLines(lines);

  it("tách từ trên giản thể và giữ bản gốc phồn thể để hiển thị", () => {
    const leave = tokenized[1].tokens.find((t) => t.simplified === "离开");
    expect(leave?.text).toBe("離開");
    expect(tokenized[1].tokens.map((t) => t.text).join("")).toBe(lines[1].text);
  });

  it("dòng không có chữ Hán không bị tách, token không phải Hán", () => {
    expect(tokenized[3].tokens.filter((t) => t.isHan).map((t) => t.simplified)).toEqual(["城市"]);
  });

  it("collectHanTerms không trùng", () => {
    const terms = collectHanTerms(tokenized);
    expect(terms.filter((t) => t === "城市")).toHaveLength(1);
    expect(terms).toContain("回忆");
  });
});

describe("buildVocabCandidates", () => {
  const candidates = buildVocabCandidates(tokenizeLyricLines(lines), dictionary);

  it("bỏ hư từ và từ 1 chữ cơ bản, giữ từ đáng học", () => {
    const terms = candidates.map((c) => c.term);
    expect(terms).toEqual(expect.arrayContaining(["城市", "离开", "回忆", "口袋", "慢慢"]));
    expect(terms).not.toContain("的");
    expect(terms).not.toContain("我");
    expect(terms).not.toContain("睡");
  });

  it("đếm vị trí xuất hiện theo dòng, xếp từ xuất hiện nhiều lên trước", () => {
    expect(candidates[0].term).toBe("城市");
    expect(candidates[0].occurrences.map((o) => o.lineIndex)).toEqual([0, 3]);
  });

  it("từ không có trong từ điển bị loại; giới hạn số lượng", () => {
    expect(buildVocabCandidates(tokenizeLyricLines(lines), new Map())).toEqual([]);
    expect(buildVocabCandidates(tokenizeLyricLines(lines), dictionary, { maxCandidates: 2 })).toHaveLength(2);
  });
});
