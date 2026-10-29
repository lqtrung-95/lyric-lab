import { describe, expect, it } from "vitest";
import { buildPlacementQuestions, pickCandidates, scorePlacement, shouldStopEarly, WRONG_PENALTY, type PlacementKind, type PlacementWord } from "./placement";
import { allToneVariants, toneVariants } from "./placement-pinyin";

const seeded = () => { let s = 11; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const PINYIN = ["nǐ hǎo", "xièxie", "péng yǒu", "xué xí", "gōng zuò", "hǎo", "dà", "xiǎo"];
const pool = (level: number): PlacementWord[] => Array.from({ length: 20 }, (_, i) => ({
  term: i % 2 ? `${level}字${i}` : `${level}${i}`, pinyin: "", gloss: i % 5 === 0 ? `(trợ từ) nghĩa ${level}-${i}` : `nghĩa ${level}-${i}`,
}));
const pools = Object.fromEntries([1, 2, 3, 4, 5, 6].map((l) => [l, pool(l)]));
/** Ứng viên đã bổ sung pinyin và câu thật như chỗ tải dữ liệu sẽ làm. */
const enriched = (): Record<number, PlacementWord[]> => Object.fromEntries(Object.entries(pickCandidates(pools, seeded())).map(([l, ws]) => [l, ws.map((w, i) => ({
  ...w, pinyin: PINYIN[i % PINYIN.length], sentence: { text: `我说${w.term}好`, translation: "câu dịch" },
}))]));
const build = () => buildPlacementQuestions(pools, enriched(), seeded());

describe("buildPlacementQuestions", () => {
  const qs = build();
  it("6 câu mỗi cấp, xếp từ cấp thấp lên cao, mỗi cấp đủ nhiều dạng", () => {
    expect(qs).toHaveLength(36);
    expect(qs.map((q) => q.level)).toEqual([...qs.map((q) => q.level)].sort((a, b) => a - b));
    const kinds = new Set(qs.filter((q) => q.level === 1).map((q) => q.kind));
    expect(kinds).toEqual(new Set<PlacementKind>(["meaning", "pinyin", "cloze", "reverse", "listen"]));
  });
  it("mọi câu có 4 đáp án khác nhau gồm đáp án đúng, không trùng từ trong một cấp", () => {
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.options).toContain(q.answer);
    }
    for (const l of [1, 2, 3, 4, 5, 6]) {
      const terms = qs.filter((q) => q.level === l).map((q) => q.term);
      expect(new Set(terms).size).toBe(terms.length);
    }
  });
  it("câu pinyin: đáp án nhiễu chỉ khác thanh điệu của đáp án đúng", () => {
    for (const q of qs.filter((x) => x.kind === "pinyin")) {
      const strip = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
      expect(new Set(q.options.map(strip)).size).toBe(1);
    }
  });
  it("câu chữ Hán (reverse, cloze): đáp án cùng số chữ; cloze có chỗ trống và bản dịch", () => {
    for (const q of qs.filter((x) => x.kind === "reverse" || x.kind === "cloze")) expect(new Set(q.options.map((o) => [...o].length)).size).toBe(1);
    const cloze = qs.find((q) => q.kind === "cloze")!;
    expect(cloze.before! + cloze.answer + cloze.after!).toContain(cloze.term);
    expect(cloze.translation).toBe("câu dịch");
  });
  it("nghĩa nhiễu cùng kiểu ghi chú với nghĩa đúng (không loại trừ theo '(trợ từ)')", () => {
    for (const q of qs.filter((x) => x.kind === "meaning" || x.kind === "listen")) {
      const tagged = (s: string) => s.startsWith("(");
      if (tagged(q.answer)) expect(q.options.every(tagged)).toBe(true);
    }
  });
  it("thiếu pinyin và câu thật thì rơi về câu nghĩa, vẫn đủ số câu", () => {
    const bare = Object.fromEntries(Object.entries(pickCandidates(pools, seeded())));
    const out = buildPlacementQuestions(pools, bare, seeded());
    expect(out).toHaveLength(36);
    expect(out.every((q) => ["meaning", "reverse", "listen"].includes(q.kind))).toBe(true);
  });
  it("cấp thiếu từ thì bỏ qua cấp đó", () => {
    const small = { 1: pools[1], 2: pools[2].slice(0, 3) };
    expect(buildPlacementQuestions(small, pickCandidates(small, seeded()), seeded()).every((q) => q.level === 1)).toBe(true);
  });
});

describe("scorePlacement", () => {
  const qs = build();
  const answer = (right: number[], wrongLevels: number[] = []) => qs.map((q) => (right.includes(q.level) ? q.answer : wrongLevels.includes(q.level) ? q.options.find((o) => o !== q.answer)! : null));
  it("bắt đầu ở cấp đầu tiên chưa đạt 60%", () => {
    expect(scorePlacement(qs, answer([1, 2, 3])).startLevel).toBe(4);
    expect(scorePlacement(qs, answer([])).startLevel).toBe(1);
  });
  it("nắm hết thì bắt đầu ở cấp cao nhất đã hỏi", () => {
    expect(scorePlacement(qs, answer([1, 2, 3, 4, 5, 6])).startLevel).toBe(6);
  });
  it("'Chưa biết' được 0 điểm, đoán sai bị trừ nên đoán mò không có lợi", () => {
    const unknown = scorePlacement(qs, answer([1, 2]));
    expect(unknown.byLevel[3]).toBe(0);
    expect(unknown.wrong).toBe(0);
    // Trả lời đúng 4/6 cấp 1, sai 2: 4 - 2/3 = 3.33 → 0.56 < 0.6, không đạt; còn 4 đúng + 2 "Chưa biết" = 0.67 đạt.
    const l1 = qs.filter((q) => q.level === 1);
    const guessy = qs.map((q) => (q.level !== 1 ? null : l1.indexOf(q) < 4 ? q.answer : q.options.find((o) => o !== q.answer)!));
    expect(scorePlacement(qs, guessy).byLevel[1]).toBeCloseTo((4 - 2 * WRONG_PENALTY) / 6);
    expect(scorePlacement(qs, guessy).startLevel).toBe(1);
    const honest = qs.map((q) => (q.level !== 1 ? null : l1.indexOf(q) < 4 ? q.answer : null));
    expect(scorePlacement(qs, honest).byLevel[1]).toBeCloseTo(4 / 6);
  });
  it("điểm không âm và có điểm theo từng dạng câu", () => {
    const r = scorePlacement(qs, answer([], [1, 2, 3, 4, 5, 6]));
    expect(Math.min(...Object.values(r.byLevel))).toBe(0);
    expect(r.wrong).toBe(36);
    const ok = scorePlacement(qs, answer([1, 2, 3, 4, 5, 6]));
    expect(ok.byKind.pinyin).toBe(1);
    expect(ok.byKind.listen).toBe(1);
  });
});

describe("shouldStopEarly", () => {
  it("dừng khi hai cấp liên tiếp gần nhất dưới 40%", () => {
    expect(shouldStopEarly({ 1: 0.9, 2: 0.3, 3: 0.2 })).toBe(true);
    expect(shouldStopEarly({ 1: 0.3, 2: 0.2 })).toBe(true);
  });
  it("không dừng khi mới một cấp, hoặc chỉ một cấp yếu, hoặc cấp yếu không liền nhau", () => {
    expect(shouldStopEarly({ 1: 0.1 })).toBe(false);
    expect(shouldStopEarly({ 1: 0.9, 2: 0.3 })).toBe(false);
    expect(shouldStopEarly({ 1: 0.3, 2: 0.9, 3: 0.3 })).toBe(false);
  });
});

describe("toneVariants", () => {
  it("một âm tiết: đủ 3 thanh khác; nhiều âm tiết: chỉ đổi một âm tiết", () => {
    expect(new Set(allToneVariants("hǎo"))).toEqual(new Set(["hāo", "háo", "hào"]));
    expect(toneVariants("hǎo", 3, seeded())).toHaveLength(3);
    for (const v of toneVariants("nǐ hǎo", 3, seeded())) expect(v.split(" ")).toHaveLength(2);
  });
  it("không có đáp án trùng đúng và giữ ü; thanh nhẹ không đổi được", () => {
    expect(allToneVariants("nǚ")).not.toContain("nǚ");
    expect(allToneVariants("nǚ")).toContain("nǜ");
    expect(allToneVariants("ma")).toEqual([]);
    expect(allToneVariants("xièxie").every((v) => v.endsWith("xie"))).toBe(true);
  });
});
