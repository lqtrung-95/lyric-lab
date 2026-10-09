import { describe, expect, it } from "vitest";
import { restoreLineTranslation } from "./restore-line-translation";
import type { LessonLine } from "./video-lesson-types";

const line = (idx: number, translation: string, translationBy?: "ai" | "admin"): LessonLine => ({ idx, start: idx, end: idx + 1, text: "你好", pinyin: "nǐ hǎo", translation, tokens: [{ text: "你好" }], ...(translationBy ? { translationBy } : {}) });

describe("restoreLineTranslation", () => {
  it("trả bản cũ cho dòng AI đã dịch lại và khóa dòng khỏi AI", () => {
    const lines = [line(0, "Giữ nguyên"), line(1, "Bản AI", "ai")];
    const out = restoreLineTranslation(lines, 1, " Bản gốc ")!;
    expect(out[1]).toMatchObject({ translation: "Bản gốc", translationBy: "admin" });
    expect(out[0]).toBe(lines[0]);
    expect(lines[1].translation).toBe("Bản AI"); // không sửa mảng gốc
  });

  it("không đổi gì khi dòng không còn là bản AI (admin đã sửa/khôi phục), không có dòng, hoặc bản cũ rỗng", () => {
    expect(restoreLineTranslation([line(0, "Admin sửa", "admin")], 0, "Bản gốc")).toBeNull();
    expect(restoreLineTranslation([line(0, "Gốc")], 0, "Bản cũ")).toBeNull();
    expect(restoreLineTranslation([line(0, "AI", "ai")], 5, "Bản gốc")).toBeNull();
    expect(restoreLineTranslation([line(0, "AI", "ai")], 0, "  ")).toBeNull();
    expect(restoreLineTranslation([line(0, "AI", "ai")], 0, null)).toBeNull();
  });
});
