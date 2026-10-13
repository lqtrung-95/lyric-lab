import { describe, expect, it } from "vitest";
import { containsChatProfanity } from "./chat-profanity";
import { CHAT_MAX_CHARS, normalizeChatBody, validateChatBody } from "./validate-chat-message";

describe("normalizeChatBody", () => {
  it("gọn khoảng trắng, giữ tối đa một dòng trống, bỏ khoảng trắng đầu cuối", () => {
    expect(normalizeChatBody("  xin   chào \r\n\r\n\r\n\r\nbạn  ")).toBe("xin chào\n\nbạn");
  });
});

describe("validateChatBody", () => {
  it("tin bình thường hợp lệ (tiếng Việt, chữ Hán, emoji)", () => {
    for (const ok of ["Chào mọi người, hôm nay học bài nào?", "我喜欢这首歌 😊", "các bạn ơi, bài này hay lắm"]) expect(validateChatBody(ok)).toBeNull();
  });
  it("rỗng hoặc quá dài", () => {
    expect(validateChatBody("")).toBe("empty");
    expect(validateChatBody("a ".repeat(CHAT_MAX_CHARS))).toBe("too_long");
  });
  it("chặn link và địa chỉ web với người thường nhưng cho quản trị viên", () => {
    for (const bad of ["xem https://example.com nhé", "vào www.abc.xyz đi", "kiếm tiền tại site.vn/abc", "liên hệ shop.com"]) {
      expect(validateChatBody(bad)).toBe("has_link");
      expect(validateChatBody(bad, true)).toBeNull();
    }
  });
  it("không nhầm số thập phân, dấu chấm câu hay từ thường với địa chỉ web", () => {
    for (const ok of ["HSK 3.5 khó không?", "Hay quá.Mình thích", "học xong rồi.nghe tiếp", "pi = 3.14"]) expect(validateChatBody(ok)).toBeNull();
  });
  it("chặn spam lặp ký tự hoặc lặp từ", () => {
    expect(validateChatBody("aaaaaaaaaaaaaa")).toBe("spam");
    expect(validateChatBody("hay hay hay hay hay hay hay")).toBe("spam");
  });
  it("chặn từ tục rõ ràng nhưng không chặn từ thường gặp bị bỏ dấu giống", () => {
    expect(validateChatBody("đ.m cái app này")).toBeNull(); // "d m" tách hai chữ cái, không phải từ trong danh sách
    expect(validateChatBody("dit me")).toBe("inappropriate");
    expect(validateChatBody("vcl")).toBe("inappropriate");
    for (const ok of ["đủ mệt rồi", "các bạn", "địt là gì tiếng Trung", "mình ăn cơm đã"]) expect(validateChatBody(ok)).toBeNull();
  });
});

describe("containsChatProfanity", () => {
  it("khớp từ riêng và hai từ liền nhau, đổi chữ số thay chữ", () => {
    expect(containsChatProfanity("d1t m3")).toBe(true);
    expect(containsChatProfanity("fuck")).toBe(true);
    expect(containsChatProfanity("Shit!")).toBe(true);
  });
  it("không khớp bên trong từ vô hại", () => {
    expect(containsChatProfanity("classic Mandarin")).toBe(false);
    expect(containsChatProfanity("document")).toBe(false);
  });
});
