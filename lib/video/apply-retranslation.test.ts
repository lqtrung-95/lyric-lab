import { describe, expect, it } from "vitest";
import { applyRetranslation } from "./apply-retranslation";
import type { LessonLine } from "./video-lesson-types";

const line = (idx: number, translation: string | null, translationBy?: "ai" | "admin"): LessonLine =>
  ({ idx, start: idx, end: idx + 1, text: `câu ${idx}`, pinyin: "", translation, tokens: [], ...(translationBy ? { translationBy } : {}) });

describe("applyRetranslation", () => {
  it("thay bản dịch cũ bằng bản AI và đánh dấu AI", () => {
    const r = applyRetranslation([line(0, "cũ"), line(1, "cũ 2")], [{ translation: "mới" }, { translation: "mới 2" }]);
    expect(r.lines.map((l) => [l.translation, l.translationBy])).toEqual([["mới", "ai"], ["mới 2", "ai"]]);
    expect(r).toMatchObject({ replaced: 2, remaining: 0, translatedLineCount: 2 });
  });
  it("giữ nguyên dòng admin đã sửa và dòng AI đã dịch lại trước đó", () => {
    const r = applyRetranslation([line(0, "admin", "admin"), line(1, "ai cũ", "ai"), line(2, "youtube")], [{ translation: "x" }, { translation: "y" }, { translation: "z" }]);
    expect(r.lines.map((l) => l.translation)).toEqual(["admin", "ai cũ", "z"]);
    expect(r.replaced).toBe(1);
  });
  it("dòng AI chưa dịch được thì giữ bản cũ và tính là còn lại, không để trống", () => {
    const r = applyRetranslation([line(0, "cũ"), line(1, "cũ 2")], [{ translation: "mới" }, { translation: null }]);
    expect(r.lines.map((l) => l.translation)).toEqual(["mới", "cũ 2"]);
    expect(r).toMatchObject({ replaced: 1, remaining: 1 });
  });
  it("includeAi: làm lại cả dòng AI cũ nhưng vẫn giữ dòng admin đã sửa", () => {
    const r = applyRetranslation([line(0, "admin", "admin"), line(1, "ai cũ", "ai"), line(2, "youtube")], [{ translation: "x" }, { translation: "y" }, { translation: "z" }], true);
    expect(r.lines.map((l) => l.translation)).toEqual(["admin", "y", "z"]);
    expect(r.replaced).toBe(2);
  });
  it("không sửa mảng gốc", () => {
    const before = [line(0, "cũ")];
    applyRetranslation(before, [{ translation: "mới" }]);
    expect(before[0].translation).toBe("cũ");
  });
});
