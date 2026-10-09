import { describe, expect, it } from "vitest";
import { applyTranslations } from "./apply-translations";
import type { LessonLine } from "./video-lesson-types";

const line = (idx: number, translation: string | null, translationBy?: "ai" | "admin"): LessonLine => ({ idx, start: idx, end: idx + 1, text: "你好", pinyin: "nǐ hǎo", translation, tokens: [{ text: "你好" }], ...(translationBy ? { translationBy } : {}) });

describe("applyTranslations", () => {
  it("chỉ điền dòng còn trống, đánh dấu bản AI, giữ nguyên dòng đã có (kể cả bản admin)", () => {
    const before = [line(0, "Có sẵn"), line(1, null), line(2, "Admin sửa", "admin"), line(3, null)];
    const out = applyTranslations(before, [{ translation: "AI đè?" }, { translation: " Dịch mới " }, { translation: "AI đè?" }, { translation: null }]);
    expect(out.lines.map((l) => l.translation)).toEqual(["Có sẵn", "Dịch mới", "Admin sửa", null]);
    expect(out.lines[1].translationBy).toBe("ai");
    expect(out.lines[0]).toBe(before[0]);
    expect(out.lines[2]).toBe(before[2]);
    expect(out.newlyTranslated).toBe(1);
    expect(out.translatedLineCount).toBe(3);
    expect(before[1].translation).toBeNull(); // không sửa mảng gốc
  });

  it("không có kết quả dịch thì không đổi gì", () => {
    const out = applyTranslations([line(0, null)], []);
    expect(out).toMatchObject({ newlyTranslated: 0, translatedLineCount: 0 });
  });
});
