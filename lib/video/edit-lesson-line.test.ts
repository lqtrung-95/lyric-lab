import { describe, expect, it } from "vitest";
import { MAX_TRANSLATION_CHARS, withLineTranslation } from "./edit-lesson-line";
import type { LessonLine } from "./video-lesson-types";

const line = (idx: number, translation: string | null): LessonLine => ({ idx, start: idx, end: idx + 1, text: "你好朋友", pinyin: "nǐ hǎo péng you", translation, tokens: [{ text: "你好" }] });
const lines = [line(0, "Xin chào"), line(1, null)];

describe("withLineTranslation", () => {
  it("đặt bản dịch cho dòng trống, chuẩn hóa khoảng trắng và đếm lại số dòng có dịch", () => {
    const r = withLineTranslation(lines, 1, "  Hẹn   gặp lại ")!;
    expect(r.lines[1].translation).toBe("Hẹn gặp lại");
    expect(r.translatedLineCount).toBe(2);
    expect(lines[1].translation).toBeNull(); // không sửa mảng gốc
  });
  it("chuỗi rỗng xóa bản dịch", () => {
    const r = withLineTranslation(lines, 0, "   ")!;
    expect(r.lines[0].translation).toBeNull();
    expect(r.translatedLineCount).toBe(0);
  });
  it("từ chối dòng không tồn tại hoặc bản dịch quá dài", () => {
    expect(withLineTranslation(lines, 9, "x")).toBeNull();
    expect(withLineTranslation(lines, 0, "x".repeat(MAX_TRANSLATION_CHARS + 1))).toBeNull();
  });
});
