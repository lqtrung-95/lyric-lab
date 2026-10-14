import { describe, expect, it, vi } from "vitest";
import type { ChatRequest } from "@/lib/analysis/groq-chat";
import { GEMINI_MODELS } from "@/lib/analysis/gemini-models";
import { classifyVideoTags } from "./classify-video-tags";

const ctx = { title: "Vlog昆明生活周记", channelTitle: "Rona", lines: ["大家好", "今天去公园"] };

describe("classifyVideoTags", () => {
  it("gửi tên, kênh và vài câu đầu, nhận thẻ hợp lệ (bỏ thẻ lạ)", async () => {
    const chat = vi.fn<(req: ChatRequest) => Promise<string>>(async () => '{"tags":["vlog","khong-co","doi-song"]}');
    expect(await classifyVideoTags(chat, ctx)).toEqual(["vlog", "doi-song"]);
    const req = chat.mock.calls[0][0];
    expect(req.user).toContain("Vlog昆明生活周记");
    expect(req.user).toContain("大家好");
    expect(req.model).toBe(GEMINI_MODELS[0]); // model nhẹ trước, không tranh hạn mức với việc nghe video
  });
  it("chịu được rào ```json và sang model sau khi model đầu lỗi hoặc trả rỗng", async () => {
    const models: string[] = [];
    const chat = async (req: ChatRequest) => { models.push(req.model); if (models.length === 1) throw new Error("Gemini 503"); return '```json\n{"tags":["du-lich"]}\n```'; };
    expect(await classifyVideoTags(chat, ctx)).toEqual(["du-lich"]);
    expect(models).toHaveLength(2);
  });
  it("AI hỏng hết thì dùng quy tắc từ khóa, không ném lỗi", async () => {
    expect(await classifyVideoTags(async () => { throw new Error("hết hạn mức"); }, ctx)).toEqual(expect.arrayContaining(["vlog"]));
    expect(await classifyVideoTags(async () => "không phải json", { title: "Xin chào", channelTitle: "K", lines: [] })).toEqual([]);
  });
});
