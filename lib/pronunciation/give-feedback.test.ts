import { describe, expect, it, vi } from "vitest";
import type { AnalyzedLine } from "@/lib/analysis/analysis-types";
import type { ChatRequest } from "@/lib/analysis/groq-chat";
import { FeedbackError, giveFeedback, isMostlyChinese, matchRatio } from "./give-feedback";

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
  it("nhận xét bằng tiếng Trung bị bỏ, thử model kế tiếp; hết model thì báo lỗi", async () => {
    const zh = JSON.stringify({ heard: "我今天想去超市", score: 92, summary: "音节清楚，连读自然，发音接近本土话。", issues: [] });
    const vi = JSON.stringify({ heard: "我今天想去超市", score: 80, summary: "Khá rõ, còn lỗi nhỏ ở thanh điệu.", issues: [] });
    const chat = vi_fn([zh, vi]);
    const out = await giveFeedback([line], req, { chat, models: ["a", "b"] });
    expect(out.summary).toContain("Khá rõ");
    expect(out.model).toBe("b");
    await expect(giveFeedback([line], req, { chat: vi_fn([zh]), models: ["a"] })).rejects.toBeInstanceOf(FeedbackError);
  });
  it("nội dung nghe được không khớp câu mẫu thì điểm bị chặn ở 30", async () => {
    const chat = async () => JSON.stringify({ heard: "你最好把嘴巴给我放干净点", score: 92, summary: "Nói câu khác hẳn.", issues: [] });
    expect((await giveFeedback([line], req, { chat, models: ["a"] })).score).toBe(30);
    const ok = async () => JSON.stringify({ heard: "我今天想去超市", score: 92, summary: "Rất rõ.", issues: [] });
    expect((await giveFeedback([line], req, { chat: ok, models: ["a"] })).score).toBe(92);
  });
});

describe("isMostlyChinese / matchRatio", () => {
  it("phân biệt tiếng Việt có xen chữ Hán với câu toàn tiếng Trung", () => {
    expect(isMostlyChinese("音节清楚，连读自然")).toBe(true);
    expect(isMostlyChinese("Chữ 超市 đọc sai thanh điệu, cần sửa lại.")).toBe(false);
    expect(isMostlyChinese("")).toBe(false);
  });
  it("tỉ lệ khớp tính theo tần suất chữ", () => {
    expect(matchRatio("我今天想去超市", "我今天想去超市")).toBe(1);
    expect(matchRatio("我今天想去超市", "")).toBe(0);
    expect(matchRatio("好好学习", "好学")).toBe(0.5);
  });
});

function vi_fn(replies: string[]) {
  let i = 0;
  return async () => replies[Math.min(i++, replies.length - 1)];
}
