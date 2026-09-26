import { describe, expect, it } from "vitest";
import { Rating } from "ts-fsrs";
import { buildChoices, buildCloze } from "./cloze";
import { buildMatchRound, shortMeaning } from "./match-round";
import { pickPracticeCards } from "./pick-practice-cards";
import { gradeFromOutcome, isGradable, outcomeFromPinyin, pinyinPoints } from "./practice-grade";
import { seededRng, shuffle } from "./random";

const NOW = new Date("2026-03-10T08:00:00Z");
const at = (days: number) => new Date(NOW.getTime() + days * 86_400_000).toISOString();
const card = (key: string, state: number, dueDays: number, over: object = {}) => ({
  item_key: key, state, due: at(dueDays), last_review: state === 0 ? null : at(dueDays - 3), created_at: at(-10), ...over,
});

describe("shuffle / seededRng", () => {
  it("giữ nguyên phần tử, không sửa mảng gốc, cùng hạt giống cho cùng kết quả", () => {
    const src = [1, 2, 3, 4, 5, 6];
    const a = shuffle(src, seededRng(7));
    expect([...a].sort()).toEqual(src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
    expect(shuffle(src, seededRng(7))).toEqual(a);
  });
});

describe("pickPracticeCards", () => {
  const cards = [card("later1", 2, 5), card("due2", 2, -1), card("due1", 2, -9), card("new1", 0, 0), card("later2", 1, 2, { last_review: at(-30) })];

  it("thẻ đến hạn vào trước, rồi thẻ ôn lâu nhất, rồi thẻ mới; cắt theo số lượng", () => {
    const keys = (n: number) => pickPracticeCards(cards, n, NOW, seededRng(1)).map((c) => c.item_key).sort();
    expect(keys(2)).toEqual(["due1", "due2"]);
    expect(keys(3)).toEqual(["due1", "due2", "later2"]);
    expect(keys(5)).toEqual(["due1", "due2", "later1", "later2", "new1"]);
    expect(pickPracticeCards([], 5, NOW)).toEqual([]);
  });
});

describe("practice-grade", () => {
  it("kết quả gõ pinyin → mức FSRS, không bao giờ 'Dễ'", () => {
    expect(gradeFromOutcome(outcomeFromPinyin("exact"))).toBe(Rating.Good);
    expect(gradeFromOutcome(outcomeFromPinyin("no-tone"))).toBe(Rating.Hard);
    expect(gradeFromOutcome(outcomeFromPinyin("wrong-tone"))).toBe(Rating.Hard);
    expect(gradeFromOutcome(outcomeFromPinyin("wrong"))).toBe(Rating.Again);
    for (const o of ["correct", "partial", "wrong"] as const) expect(gradeFromOutcome(o)).not.toBe(Rating.Easy);
  });

  it("chỉ thẻ đã học và đã đến hạn mới được chấm", () => {
    expect(isGradable({ state: 2, due: at(-1) }, NOW)).toBe(true);
    expect(isGradable({ state: 2, due: at(1) }, NOW)).toBe(false);
    expect(isGradable({ state: 0, due: at(-1) }, NOW)).toBe(false);
  });

  it("điểm: gợi ý trừ điểm, combo cộng tối đa 10 bậc, sai là 0", () => {
    expect(pinyinPoints("correct", 0, 0)).toBe(100);
    expect(pinyinPoints("correct", 2, 0)).toBe(60);
    expect(pinyinPoints("correct", 9, 0)).toBe(20);
    expect(pinyinPoints("partial", 0, 3)).toBe(65);
    expect(pinyinPoints("correct", 0, 99)).toBe(150);
    expect(pinyinPoints("wrong", 0, 5)).toBe(0);
  });
});

describe("buildCloze", () => {
  it("đục lỗ ở lần xuất hiện đầu tiên; không có trong câu thì null", () => {
    expect(buildCloze("离开", "我从来没想过会离开")).toEqual({ before: "我从来没想过会", after: "" });
    expect(buildCloze("我", "我爱我")).toEqual({ before: "", after: "爱我" });
    expect(buildCloze("星", "窗外的城市")).toBeNull();
    expect(buildCloze("", "abc")).toBeNull();
  });
});

describe("buildChoices", () => {
  const pool = ["离开", "回忆", "星光", "口袋", "天亮", "出发", "城", "从来", "离开"];

  it("4 đáp án gồm từ đúng, không trùng, không có từ đã nằm trong câu, ưu tiên cùng độ dài", () => {
    const choices = buildChoices("离开", pool, "我从来没想过会___", seededRng(3));
    expect(choices).toHaveLength(4);
    expect(new Set(choices).size).toBe(4);
    expect(choices).toContain("离开");
    expect(choices).not.toContain("从来"); // đã nằm trong câu: sẽ có hai đáp án hợp lệ
    expect(choices.filter((c) => c !== "离开").every((c) => [...c].length === 2)).toBe(true);
  });

  it("ít từ nhiễu thì trả ít đáp án hơn, vẫn có từ đúng", () => {
    expect(buildChoices("离开", ["离开", "回忆"], "", seededRng(1)).sort()).toEqual(["回忆", "离开"].sort());
  });
});

describe("match round", () => {
  it("shortMeaning lấy phần đầu và cắt ngắn", () => {
    expect(shortMeaning("rời đi, rời khỏi")).toBe("rời đi");
    expect(shortMeaning("a".repeat(80))).toHaveLength(38);
    expect(shortMeaning("  ")).toBe("");
  });

  const cards = [
    { item_key: "v:a", term: "离开", pinyin: "lí kāi", meaning: "rời đi, rời khỏi" },
    { item_key: "v:b", term: "回忆", pinyin: "huí yì", meaning: "ký ức" },
    { item_key: "v:c", term: "星光", pinyin: "xīng guāng", meaning: "ánh sao" },
    { item_key: "v:d", term: "离去", pinyin: "lí qù", meaning: "Rời đi" }, // nghĩa ngắn trùng v:a
    { item_key: "v:e", term: "口袋", pinyin: null, meaning: "  " }, // không có nghĩa
  ];

  it("cột trái và phải cùng bộ id, bỏ thẻ trùng nghĩa hoặc rỗng nghĩa", () => {
    const round = buildMatchRound(cards, 6, seededRng(2));
    const ids = round.lefts.map((l) => l.id).sort();
    expect(ids).toHaveLength(3);
    expect(round.rights.map((r) => r.id).sort()).toEqual(ids);
    expect(new Set(round.rights.map((r) => r.text.toLowerCase())).size).toBe(3);
  });

  it("giới hạn theo size", () => {
    expect(buildMatchRound(cards, 2, seededRng(2)).lefts).toHaveLength(2);
  });
});
