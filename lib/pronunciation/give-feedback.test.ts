import { describe, expect, it, vi } from "vitest";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { ChatRequest } from "@/lib/analysis/groq-chat";
import { FeedbackError, giveFeedback } from "./give-feedback";

const line = { index: 2, text: "我今天想去超市", pinyin: "wǒ jīn tiān xiǎng qù chāo shì" } as unknown as AnalyzedLine;
const req = { videoId: "abcdefghijk", lineIndex: 2, mimeType: "audio/wav" as const, audio: "QUJD".repeat(40) };

describe("giveFeedback", () => {
  it("gửi pinyin của câu cho model, trả điểm làm tròn và chỉ giữ lỗi trỏ tới chữ có trong câu mẫu", async () => {
    const chat = vi.fn<(r: ChatRequest) => Promise<string>>(async () => JSON.stringify({
      heard: "我今天想去超市", score: 71.6, summary: "Còn lỗi thanh điệu.",
      issues: [{ word: "超市", problem: "thanh 4 đọc thành thanh 1" }, { word: "苹果", problem: "chữ không có trong câu" }],
    }));
    const out = await giveFeedback([line], req, { chat, models: ["gemini:test"] });
    expect(chat.mock.calls[0][0].user).toContain("wǒ jīn tiān xiǎng qù chāo shì");
    expect(chat.mock.calls[0][0].system).toContain("chấm NGHIÊM");
    expect(out.score).toBe(72);
    expect(out.issues.map((i) => i.word)).toEqual(["超市"]);
  });
  it("không có dòng thì line_not_found; model lỗi hết thì feedback_failed", async () => {
    await expect(giveFeedback([], req, { chat: async () => "{}", models: ["m"] })).rejects.toMatchObject({ code: "line_not_found" });
    await expect(giveFeedback([line], req, { chat: async () => { throw new Error("boom"); }, models: ["m"] })).rejects.toBeInstanceOf(FeedbackError);
  });
});
