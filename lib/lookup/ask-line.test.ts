import { describe, expect, it, vi } from "vitest";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import { AskLineError, askLine } from "./ask-line";

const line = (index: number, text: string, translation?: string): AnalyzedLine => ({ index, text, start: index, end: index + 1, pinyin: "", translation, tokens: [] });
const lines = [line(0, "你好吗", "Bạn khỏe không"), line(1, "我很好", "Tôi khỏe"), line(2, "谢谢你")];
const req = { videoId: "dQw4w9WgXcQ", lineIndex: 1, question: "Vì sao dùng 很?" };

describe("askLine", () => {
  it("gửi câu hỏi kèm câu trước/sau và trả câu trả lời", async () => {
    const chat = vi.fn(async () => JSON.stringify({ answer: "很 làm câu tự nhiên hơn." }));
    const out = await askLine(lines, req, { chat, models: ["m1"] });
    expect(out).toEqual({ answer: "很 làm câu tự nhiên hơn.", model: "m1" });
    const user = (chat.mock.calls[0] as unknown as [{ user: string }])[0].user;
    expect(user).toContain("Câu trước: 你好吗");
    expect(user).toContain("CÂU ĐANG HỌC: 我很好");
    expect(user).toContain("Câu sau: 谢谢你");
    expect(user).toContain("Vì sao dùng 很?");
  });

  it("đưa các lượt hỏi đáp trước vào prompt", async () => {
    const chat = vi.fn(async () => JSON.stringify({ answer: "ok" }));
    await askLine(lines, { ...req, history: [{ q: "Câu hỏi cũ", a: "Trả lời cũ" }] }, { chat, models: ["m1"] });
    expect((chat.mock.calls[0] as unknown as [{ user: string }])[0].user).toContain("Hỏi: Câu hỏi cũ\nĐáp: Trả lời cũ");
  });

  it("model đầu lỗi hoặc trả sai dạng thì thử model kế", async () => {
    const chat = vi.fn(async ({ model }: { model: string }) => (model === "a" ? "không phải JSON" : JSON.stringify({ answer: "đáp" })));
    expect((await askLine(lines, req, { chat, models: ["a", "b"] })).model).toBe("b");
  });

  it("câu không có trong bài thì báo lỗi, không gọi LLM", async () => {
    const chat = vi.fn();
    await expect(askLine(lines, { ...req, lineIndex: 99 }, { chat, models: ["m"] })).rejects.toMatchObject({ code: "line_not_found" });
    expect(chat).not.toHaveBeenCalled();
  });

  it("hết hạn mức thì từ chối trước khi gọi LLM", async () => {
    const chat = vi.fn();
    await expect(askLine(lines, req, { chat, models: ["m"], allowLlmCall: () => false })).rejects.toBeInstanceOf(AskLineError);
    expect(chat).not.toHaveBeenCalled();
  });

  it("mọi model đều lỗi thì báo ask_failed", async () => {
    const chat = vi.fn(async () => { throw new Error("boom"); });
    await expect(askLine(lines, req, { chat, models: ["a", "b"] })).rejects.toMatchObject({ code: "ask_failed" });
  });
});
