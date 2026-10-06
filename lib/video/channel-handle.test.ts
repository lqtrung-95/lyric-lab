import { describe, expect, it } from "vitest";
import { isTransientCaptionError, normalizeChannelHandle } from "./channel-handle";

describe("normalizeChannelHandle", () => {
  it("nhận tên kênh có hoặc không có @ và đường dẫn", () => {
    expect(normalizeChannelHandle("ChineseGlow")).toBe("ChineseGlow");
    expect(normalizeChannelHandle("  @ChineseGlow ")).toBe("ChineseGlow");
    expect(normalizeChannelHandle("https://www.youtube.com/@ChineseGlow/videos?view=0")).toBe("ChineseGlow");
    expect(normalizeChannelHandle("youtube.com/@a.b-c_d")).toBe("a.b-c_d");
  });
  it("từ chối chuỗi rỗng, quá ngắn hoặc có ký tự lạ", () => {
    for (const bad of ["", "  ", "ab", "a b c", "kênh có dấu", "https://example.com/x", "x".repeat(101)]) expect(normalizeChannelHandle(bad)).toBeNull();
  });
});

describe("isTransientCaptionError", () => {
  it("nhận lỗi 429 và lỗi tải phụ đề thất bại, bỏ qua lỗi khác", () => {
    expect(isTransientCaptionError(new Error("YouTube từ chối tải caption (429)"))).toBe(true);
    expect(isTransientCaptionError(new Error("Tải caption thất bại"))).toBe(true);
    expect(isTransientCaptionError(new Error("Không có phụ đề"))).toBe(false);
    expect(isTransientCaptionError(undefined)).toBe(false);
  });
});
