import { describe, expect, it } from "vitest";
import { DAY_GROUPS, DAY_QUIZ, WEEKDAYS } from "./days-data";
import type { PhraseGroup, QuizQuestion } from "./everyday-types";
import { DATE_PHRASES, DATE_QUIZ, formatChineseDate, MONTHS, numberReading, yearReading } from "./months-dates";
import { SORRY_COMPARE, SORRY_GROUPS, SORRY_QUIZ } from "./sorry-data";
import { THANKS_GROUPS, THANKS_QUIZ } from "./thanks-data";

const quizzes: [string, QuizQuestion[]][] = [["thứ", DAY_QUIZ], ["tháng ngày", DATE_QUIZ], ["cảm ơn", THANKS_QUIZ], ["xin lỗi", SORRY_QUIZ]];
const groups: [string, PhraseGroup[]][] = [["thứ", DAY_GROUPS], ["cảm ơn", THANKS_GROUPS], ["xin lỗi", SORRY_GROUPS]];

describe.each(quizzes)("quiz %s", (_name, qs) => {
  it("đáp án hợp lệ, lựa chọn không trùng, có lời giải thích", () => {
    expect(qs.length).toBeGreaterThanOrEqual(6);
    for (const q of qs) {
      expect(q.answer, q.prompt).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.prompt).toBeLessThan(q.options.length);
      expect(new Set(q.options).size, q.prompt).toBe(q.options.length);
      expect(q.explain.length, q.prompt).toBeGreaterThan(10);
    }
  });
});

describe.each(groups)("nhóm câu %s", (_name, gs) => {
  it("mọi câu có chữ Hán, pinyin có dấu thanh, nghĩa tiếng Việt; không trùng", () => {
    const all = gs.flatMap((g) => g.phrases);
    expect(new Set(all.map((p) => p.zh)).size).toBe(all.length);
    for (const p of all) {
      expect(p.zh, p.zh).toMatch(/\p{Script=Han}/u);
      expect(p.pinyin, p.zh).toMatch(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]|^[a-z' ]+$/i);
      expect(p.vi.length, p.zh).toBeGreaterThan(1);
    }
  });
});

describe("ngày trong tuần", () => {
  it("bảy ngày, Thứ Hai là 星期一 và Chủ Nhật có cả 星期天", () => {
    expect(WEEKDAYS).toHaveLength(7);
    expect(WEEKDAYS[0]).toMatchObject({ zh: "星期一", vi: "Thứ Hai" });
    expect(WEEKDAYS[6]).toMatchObject({ zh: "星期日", alt: "星期天", vi: "Chủ Nhật" });
  });
});

describe("đọc số, năm và ngày", () => {
  it("số 1–99 đọc đúng", () => {
    expect(numberReading(1)).toEqual({ zh: "一", pinyin: "yī" });
    expect(numberReading(10)).toEqual({ zh: "十", pinyin: "shí" });
    expect(numberReading(12)).toEqual({ zh: "十二", pinyin: "shí'èr" });
    expect(numberReading(20)).toEqual({ zh: "二十", pinyin: "èrshí" });
    expect(numberReading(28)).toEqual({ zh: "二十八", pinyin: "èrshíbā" });
    expect(numberReading(31)).toEqual({ zh: "三十一", pinyin: "sānshíyī" });
    expect(() => numberReading(0)).toThrow();
  });
  it("năm đọc từng chữ số", () => {
    expect(yearReading(2026)).toEqual({ zh: "二零二六", pinyin: "èr líng èr liù" });
  });
  it("mười hai tháng", () => {
    expect(MONTHS).toHaveLength(12);
    expect(MONTHS[0]).toEqual({ zh: "一月", pinyin: "yīyuè", vi: "Tháng 1" });
    expect(MONTHS[11]).toEqual({ zh: "十二月", pinyin: "shí'èryuè", vi: "Tháng 12" });
  });
  it("ngày đầy đủ: văn viết dùng 日, khẩu ngữ dùng 号, kèm thứ đúng", () => {
    const d = formatChineseDate(2026, 10, 28); // Thứ Tư
    expect(d.written.zh).toBe("二零二六年十月二十八日");
    expect(d.spoken.zh).toBe("二零二六年十月二十八号");
    expect(d.spoken.pinyin).toBe("èr líng èr liù nián shíyuè èrshíbā hào");
    expect(d.weekday).toMatchObject({ zh: "星期三", vi: "Thứ Tư" });
    expect(formatChineseDate(2026, 11, 1).weekday.zh).toBe("星期日"); // Chủ Nhật
    expect(formatChineseDate(2024, 2, 29).weekday.zh).toBe("星期四"); // năm nhuận
  });
  it("ngày không tồn tại thì báo lỗi", () => {
    expect(() => formatChineseDate(2026, 2, 30)).toThrow(RangeError);
    expect(() => formatChineseDate(2026, 13, 1)).toThrow(RangeError);
  });
  it("mẫu câu về ngày tháng không trống", () => {
    expect(DATE_PHRASES.length).toBeGreaterThanOrEqual(6);
  });
});

describe("so sánh xin lỗi", () => {
  it("có ba cách xin lỗi chính, mỗi cách có ví dụ", () => {
    expect(SORRY_COMPARE.map((s) => s.zh)).toEqual(["对不起", "不好意思", "抱歉"]);
    for (const s of SORRY_COMPARE) expect(s.example.zh).toContain(s.zh);
  });
});
