import { describe, expect, it } from "vitest";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { classifyQuery } from "./classify-query";
import { englishStrength, popularityBonus, rankCandidates, type Candidate } from "./rank-results";

const row = (simplified: string, pinyin: string, meanings: string[], hsk: number | null = null, frequency: number | null = null, traditional = simplified): DictWordRow =>
  ({ simplified, traditional, pinyin, meanings, hsk_level: hsk, frequency });

describe("popularityBonus", () => {
  it("HSK thấp và tần suất cao điểm hơn; không có thì 0", () => {
    expect(popularityBonus(1, 130)).toBeGreaterThan(popularityBonus(5, 130));
    expect(popularityBonus(1, 10)).toBeGreaterThan(popularityBonus(1, 5000));
    expect(popularityBonus(null, 1_000_000)).toBe(0);
  });
});

describe("englishStrength", () => {
  it("khớp trọn ý > khớp nguyên từ > chứa chuỗi", () => {
    expect(englishStrength(["to love; to like"], "love")?.match).toBe(520);
    expect(englishStrength(["lovely smile"], "love")?.match).toBe(120);
    expect(englishStrength(["true love forever"], "love")?.match).toBe(300);
    expect(englishStrength(["glove"], "love")?.match).toBe(120);
    expect(englishStrength(["hate"], "love")).toBeNull();
  });
});

describe("rankCandidates", () => {
  it("chữ Hán: khớp đúng > tiền tố > chứa, rồi theo HSK", () => {
    const q = classifyQuery("爱");
    const c: Candidate[] = [
      { row: row("可爱", "kě ài", ["lovely"], 2, 799), source: "han" },
      { row: row("爱情", "ài qíng", ["love"], 2, 1164), source: "han" },
      { row: row("爱", "ài", ["to love"], 1, 130, "愛"), source: "han" },
    ];
    expect(rankCandidates(c, q, "爱", 10).map((r) => r.simplified)).toEqual(["爱", "爱情", "可爱"]);
  });
  it("tìm bằng phồn thể ra đúng mục, gộp các cách đọc thành một từ, cách đọc chính đứng đầu", () => {
    const q = classifyQuery("的");
    const c: Candidate[] = [
      { row: row("的", "dī", ["taxi"], 1, 1), source: "han" },
      { row: row("的", "de", ["possessive particle"], 1, 1), source: "han" },
      { row: row("的", "Dí", ["surname Di"], null, null), source: "han" },
    ];
    const [r] = rankCandidates(c, q, "的", 10);
    expect(rankCandidates(c, q, "的", 10)).toHaveLength(1);
    expect(r.readings.at(-1)?.pinyin).toBe("Dí");
  });
  it("cùng cấp HSK: cách đọc nhiều nghĩa hơn lên trước (的 de trước dī); ghi đè thủ công (说 shuō) thắng", () => {
    const q = classifyQuery("的");
    const de = row("的", "de", ["of", "used after attribute", "emphasis"], 1, 1);
    const di = row("的", "dī", ["taxi"], 1, 1);
    expect(rankCandidates([{ row: di, source: "han" }, { row: de, source: "han" }], q, "的", 5)[0].readings.map((r) => r.pinyin)).toEqual(["de", "dī"]);
    const shui = row("说", "shuì", ["to persuade", "to try to persuade", "x"], 1, 5);
    const shuo = row("说", "shuō", ["to say"], 1, 5);
    expect(rankCandidates([{ row: shui, source: "han" }, { row: shuo, source: "han" }], classifyQuery("说"), "说", 5)[0].readings[0].pinyin).toBe("shuō");
  });
  it("pinyin: khớp đúng âm tiết trước tiền tố; gõ có dấu thì thưởng đúng thanh", () => {
    const q = classifyQuery("ma");
    const c: Candidate[] = [
      { row: row("妈妈", "mā ma", ["mom"], 1, 500), source: "pinyin" },
      { row: row("吗", "ma", ["question particle"], 1, 20), source: "pinyin" },
    ];
    expect(rankCandidates(c, q, "", 10)[0].simplified).toBe("吗");
    const toned = classifyQuery("mā");
    expect(rankCandidates([{ row: row("妈", "mā", ["mom"], 1, 900), source: "pinyin" }, { row: row("吗", "ma", ["particle"], 1, 20), source: "pinyin" }], toned, "", 10)[0].simplified).toBe("妈");
  });
  it("nghĩa tiếng Anh: 'love' ra 爱 (khớp ý) trước 手套 glove", () => {
    const q = classifyQuery("love");
    const c: Candidate[] = [
      { row: row("手套", "shǒu tào", ["glove"], 4, 3000), source: "english" },
      { row: row("爱", "ài", ["to love; to be fond of"], 1, 130), source: "english" },
    ];
    expect(rankCandidates(c, q, "", 10)[0].simplified).toBe("爱");
  });
  it("cắt theo limit", () => {
    const q = classifyQuery("a");
    const c = Array.from({ length: 5 }, (_, i) => ({ row: row(`字${i}`, "a", ["x"]), source: "pinyin" as const }));
    expect(rankCandidates(c, q, "", 3)).toHaveLength(3);
  });
});
