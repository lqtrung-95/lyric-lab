import { describe, expect, it } from "vitest";
import { EMPTY_NOTES, MAX_NOTE_CHARS, MAX_NOTES, parseWordNotes, setWordNote } from "./word-notes";

describe("ghi chú cá nhân theo từ", () => {
  it("đặt, sửa, xóa; rỗng thì xóa", () => {
    let n = setWordNote(EMPTY_NOTES, "厉害", "  nhớ: lệ hại  ");
    expect(n).toEqual({ 厉害: "nhớ: lệ hại" });
    n = setWordNote(n, "厉害", "mẹo mới");
    expect(n["厉害"]).toBe("mẹo mới");
    expect(setWordNote(n, "厉害", "   ")).toEqual({});
    expect(setWordNote(EMPTY_NOTES, "好", "")).toBe(EMPTY_NOTES);
  });
  it("cắt ghi chú quá dài", () => {
    expect(setWordNote(EMPTY_NOTES, "好", "x".repeat(MAX_NOTE_CHARS + 50))["好"]).toHaveLength(MAX_NOTE_CHARS);
  });
  it("đầy thì không thêm từ mới nhưng vẫn sửa được từ cũ", () => {
    const full: Record<string, string> = {};
    for (let i = 0; i < MAX_NOTES; i++) full[String.fromCodePoint(0x4e00 + i)] = "a";
    expect(setWordNote(full, "龘", "b")).toBe(full);
    expect(setWordNote(full, "一", "đã sửa")["一"]).toBe("đã sửa");
  });
  it("parse bỏ khóa không phải chữ Hán, giá trị không phải chuỗi và rác", () => {
    expect(parseWordNotes({ 好: " ok ", abc: "x", 坏: 5, 人: "" })).toEqual({ 好: "ok" });
    expect(parseWordNotes(null)).toBe(EMPTY_NOTES);
    expect(parseWordNotes([1])).toBe(EMPTY_NOTES);
  });
});
