import { describe, expect, it } from "vitest";
import { buildMeaningChoices } from "./meaning-choices";
import { answerPoints, matchPoints, maxRoundPoints } from "./scoring";
import { seededRng } from "./random";

describe("answerPoints", () => {
  it("đúng: 100 cộng 5 mỗi combo, tối đa +50; không đúng: 0", () => {
    expect(answerPoints("correct", 0)).toBe(100);
    expect(answerPoints("correct", 4)).toBe(120);
    expect(answerPoints("correct", 50)).toBe(150);
    expect(answerPoints("wrong", 5)).toBe(0);
    expect(answerPoints("partial", 5)).toBe(0);
  });
});

describe("matchPoints", () => {
  it("càng nhanh càng cao, nhầm bị trừ, không thấp hơn 50", () => {
    expect(matchPoints(0, 0)).toBe(440);
    expect(matchPoints(20, 0)).toBe(360);
    expect(matchPoints(20, 2)).toBe(310);
    expect(matchPoints(120, 0)).toBe(200);
    expect(matchPoints(300, 30)).toBe(50);
  });

  it("không vượt trần hợp lệ", () => {
    expect(matchPoints(0, 0)).toBeLessThanOrEqual(maxRoundPoints("match", 6));
  });
});

describe("maxRoundPoints", () => {
  it("trần theo số câu cho chế độ chọn đáp án, cố định cho ghép cặp", () => {
    expect(maxRoundPoints("pinyin", 10)).toBe(1500);
    expect(maxRoundPoints("listen", 8)).toBe(1200);
    expect(maxRoundPoints("match", 6)).toBe(440);
  });
});

describe("buildMeaningChoices", () => {
  const pool = [
    { item_key: "v:a", meaning: "rời đi, rời khỏi" },
    { item_key: "v:b", meaning: "ký ức" },
    { item_key: "v:c", meaning: "ánh sao" },
    { item_key: "v:d", meaning: "Rời đi" }, // trùng nghĩa với v:a
    { item_key: "v:e", meaning: "Từ này ở đây mang nghĩa bóng rất dài dòng để giải thích thêm" },
    { item_key: "v:f", meaning: "túi áo" },
  ];

  it("4 đáp án gồm nghĩa đúng, không trùng nghĩa, ưu tiên nghĩa ngắn gọn", () => {
    const options = buildMeaningChoices(pool[0], pool, seededRng(5));
    expect(options).toHaveLength(4);
    expect(options.map((o) => o.key)).toContain("v:a");
    expect(options.find((o) => o.key === "v:a")!.text).toBe("rời đi");
    expect(new Set(options.map((o) => o.text.toLowerCase())).size).toBe(4);
    expect(options.map((o) => o.key)).not.toContain("v:d"); // nghĩa "Rời đi" trùng đáp án đúng
    expect(options.map((o) => o.key)).not.toContain("v:e"); // nghĩa dài bị xếp sau khi còn đủ nghĩa ngắn
  });

  it("thiếu thẻ thì trả ít đáp án hơn nhưng vẫn có đáp án đúng", () => {
    const out = buildMeaningChoices(pool[0], [pool[0], pool[1]], seededRng(1));
    expect(out.map((o) => o.key).sort()).toEqual(["v:a", "v:b"]);
  });
});
