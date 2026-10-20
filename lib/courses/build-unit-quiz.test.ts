import { describe, expect, it } from "vitest";
import { buildUnitQuiz, CLOZE_BLANK, gradeQuiz, REVIEW_QUIZ_KINDS, wordLabel } from "./build-unit-quiz";
import type { UnitWord } from "./unit-types";

const w = (term: string, gloss: string | null, meanings: string[] = []): UnitWord => ({ term, pinyin: "p", sinoViet: null, hskLevel: 1, gloss, meanings, examples: [] });
const words = [w("我", "tôi"), w("你", "bạn"), w("他", "anh ấy"), w("她", "cô ấy"), w("好", "tốt")];
const seeded = () => { let s = 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };

describe("buildUnitQuiz", () => {
  it("đủ số câu, mỗi câu có 4 lựa chọn gồm đáp án đúng đúng một lần", () => {
    const qs = buildUnitQuiz(words, seeded(), 10);
    expect(qs).toHaveLength(10);
    for (const q of qs) {
      expect(q.options).toHaveLength(4);
      expect(q.options.filter((o) => o.term === q.answer)).toHaveLength(1);
      expect(new Set(q.options.map((o) => o.term)).size).toBe(4);
    }
  });
  it("xoay ba kiểu câu hỏi; kiểu 'meaning' hiện chữ Hán, 'term' hiện nghĩa, 'listen' không có chữ", () => {
    const qs = buildUnitQuiz(words, seeded(), 9);
    expect(new Set(qs.map((q) => q.kind))).toEqual(new Set(["meaning", "term", "listen"]));
    for (const q of qs) {
      if (q.kind === "meaning") { expect(q.prompt).toBe(q.term); expect(q.options.find((o) => o.term === q.answer)!.label).toBe(wordLabel(words.find((x) => x.term === q.term)!)); }
      if (q.kind === "term") expect(q.prompt).toBe(wordLabel(words.find((x) => x.term === q.term)!));
      if (q.kind === "listen") expect(q.prompt).toBe("");
    }
  });
  it("không có hai lựa chọn cùng nghĩa hiển thị (tránh hai đáp án đúng)", () => {
    const dup = [w("你", "bạn"), w("您", "bạn"), w("我", "tôi"), w("他", "anh ấy"), w("她", "cô ấy")];
    for (const q of buildUnitQuiz(dup, seeded(), 12)) {
      const glosses = q.options.map((o) => dup.find((x) => x.term === o.term)!.gloss);
      expect(new Set(glosses).size).toBe(glosses.length);
    }
  });
  it("chưa có nghĩa Việt thì dùng nghĩa Anh; quá ít từ thì không ra đề", () => {
    expect(wordLabel(w("我", null, ["I", "me"]))).toBe("I");
    expect(buildUnitQuiz([w("我", "tôi")], seeded())).toEqual([]);
  });
});

describe("buildUnitQuiz (chặng ôn: thêm pinyin và điền chỗ trống)", () => {
  const rich = (term: string, pinyin: string, gloss: string, text?: string): UnitWord => ({
    term, pinyin, sinoViet: null, hskLevel: 2, gloss, meanings: [],
    examples: text ? [{ videoId: "v", lineIdx: 1, start: 0, end: 1, text, pinyin: "", translation: `dịch ${term}`, quality: 1 }] : [],
  });
  const pool = [rich("苹果", "píngguǒ", "quả táo", "我喜欢吃苹果"), rich("香蕉", "xiāngjiāo", "chuối", "香蕉很甜"), rich("西瓜", "xīguā", "dưa hấu", "西瓜很大"), rich("橘子", "júzi", "quýt", "橘子是黄色的"), rich("葡萄", "pútao", "nho")];

  it("dùng đủ năm kiểu; pinyin có nhãn là pinyin, cloze có chỗ trống và bản dịch, các nhãn không trùng", () => {
    const qs = buildUnitQuiz(pool, seeded(), 20, REVIEW_QUIZ_KINDS);
    expect(qs.length).toBeGreaterThan(0);
    expect(new Set(qs.map((q) => q.kind))).toEqual(new Set(["meaning", "cloze", "listen", "pinyin", "term"]));
    for (const q of qs) {
      expect(new Set(q.options.map((o) => o.label)).size).toBe(q.options.length);
      if (q.kind === "pinyin") expect(q.options.find((o) => o.term === q.answer)!.label).toBe(pool.find((x) => x.term === q.term)!.pinyin);
      if (q.kind === "cloze") { expect(q.prompt).toContain(CLOZE_BLANK); expect(q.prompt).not.toContain(q.term); expect(q.hint).toBe(`dịch ${q.term}`); }
    }
  });
  it("từ không có câu thật thì câu điền chỗ trống đổi sang chữ→nghĩa", () => {
    const noExamples = pool.map((x) => ({ ...x, examples: [] }));
    expect(buildUnitQuiz(noExamples, seeded(), 20, REVIEW_QUIZ_KINDS).some((q) => q.kind === "cloze")).toBe(false);
  });
});

describe("gradeQuiz", () => {
  it("đạt từ 70%", () => {
    expect(gradeQuiz(7, 10)).toEqual({ percent: 70, passed: true });
    expect(gradeQuiz(6, 10)).toEqual({ percent: 60, passed: false });
    expect(gradeQuiz(0, 0)).toEqual({ percent: 0, passed: false });
  });
});
