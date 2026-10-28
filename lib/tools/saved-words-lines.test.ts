import { describe, expect, it } from "vitest";
import { savedCardsToLines, shortMeaning } from "./saved-words-lines";

const card = (term: string, meaning: string, kind: "vocab" | "grammar" = "vocab") => ({ kind, term, meaning });

describe("từ đã lưu cho tờ bài tập", () => {
  it("lấy nghĩa ngắn đầu tiên, bỏ nghĩa quá dài hoặc rỗng", () => {
    expect(shortMeaning("xin chào; chào hỏi")).toBe("xin chào");
    expect(shortMeaning("hello, hi")).toBe("hello");
    expect(shortMeaning("  to   look  ")).toBe("to look");
    expect(shortMeaning("")).toBeNull();
    expect(shortMeaning("một giải thích rất rất dài vượt quá bốn mươi ký tự cho phép")).toBeNull();
  });

  it("chỉ lấy từ vựng toàn chữ Hán ngắn, không trùng, bỏ ngữ pháp, đúng số lượng", () => {
    const cards = [card("你好", "xin chào"), card("谢谢", "cảm ơn"), card("谢谢", "trùng"), card("不但…而且", "không những", "grammar"), card("A型", "nhóm A"), card("我不知道", "tôi không biết"), card("一二三四五", "quá dài"), card("老师", "")];
    const lines = savedCardsToLines(cards, 10, () => 0.5);
    expect(lines.sort()).toEqual(["你好, xin chào", "我不知道, tôi không biết", "老师", "谢谢, cảm ơn"].sort());
    expect(savedCardsToLines(cards, 2, () => 0.1)).toHaveLength(2);
    expect(savedCardsToLines([], 5)).toEqual([]);
  });
});
