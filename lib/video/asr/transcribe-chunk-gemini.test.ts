import { describe, expect, it, vi } from "vitest";
import type { ChatRequest } from "@/lib/analysis/groq-chat";
import { planAsrChunks } from "./asr-chunks";
import { ASR_BATCH_MODELS, ASR_MODELS, transcribeChunkWithGemini } from "./transcribe-chunk-gemini";

const chunk = planAsrChunks(600)[2]; // sở hữu 240–360, cửa sổ 234–366
const reply = (rows: [string, string, string][]) => JSON.stringify(rows.map(([start, end, text]) => ({ start, end, text })));

describe("transcribeChunkWithGemini", () => {
  it("gửi link YouTube kèm cửa sổ và trả dòng theo giờ tuyệt đối thuộc phần sở hữu", async () => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- tham số khai báo để chat.mock.calls có kiểu ChatRequest
    const chat = vi.fn(async (_req: ChatRequest) => reply([["03:55", "03:58", "前一段"], ["04:14", "04:18", "你好"], ["06:07", "06:10", "后一段"]]));
    const lines = await transcribeChunkWithGemini(chat, "bR01vpXyItA", chunk, 600);
    const sent = chat.mock.calls[0][0];
    expect(sent.video).toEqual({ url: "https://www.youtube.com/watch?v=bR01vpXyItA", startSec: 234, endSec: 366 });
    expect(sent.model).toBe("gemini:gemini-3-flash-preview");
    expect(sent.user).toContain("03:54 to 06:06");
    expect(lines).toEqual([{ text: "你好", start: 254, end: 258 }]);
  });
  it("mô hình tính giờ từ đầu đoạn (đa số dòng ngoài cửa sổ): thử model kế tiếp thay vì đoán", async () => {
    const wrong = reply(Array.from({ length: 10 }, (_, i) => [`00:${String(i * 8).padStart(2, "0")}`, `00:${String(i * 8 + 5).padStart(2, "0")}`, "这是一个句子"] as [string, string, string]));
    const right = reply([["04:14", "04:18", "对的"]]);
    const models: string[] = [];
    const chat = async (req: ChatRequest) => { models.push(req.model); return models.length === 1 ? wrong : right; };
    expect(await transcribeChunkWithGemini(chat, "bR01vpXyItA", chunk, 600)).toEqual([{ text: "对的", start: 254, end: 258 }]);
    expect(models).toEqual(["gemini:gemini-3-flash-preview", "gemini:gemini-2.5-flash"]);
  });
  it("mốc giờ bị nén (nhiều câu cách nhau 0,01 giây) cũng bị loại và chuyển model", async () => {
    const squashed = JSON.stringify(Array.from({ length: 20 }, (_, i) => ({ start: 240 + i * 0.01, end: 240.02 + i * 0.01, text: "居然是大晴天在附近找了一家饭店" })));
    const chat = vi.fn(async (req: ChatRequest) => (req.model.includes("3-flash") ? squashed : reply([["04:10", "04:12", "好"]])));
    expect(await transcribeChunkWithGemini(chat, "bR01vpXyItA", chunk, 600)).toHaveLength(1);
    expect(chat).toHaveBeenCalledTimes(2);
  });
  it("JSON hỏng hoặc mọi model lỗi thì ném lỗi; đoạn không có lời ([]) là hợp lệ", async () => {
    await expect(transcribeChunkWithGemini(async () => "hỏng", "bR01vpXyItA", chunk, 600)).rejects.toThrow();
    await expect(transcribeChunkWithGemini(async () => { throw new Error("Gemini 503"); }, "bR01vpXyItA", chunk, 600)).rejects.toThrow("Gemini 503");
    expect(await transcribeChunkWithGemini(async () => "[]", "bR01vpXyItA", chunk, 600)).toEqual([]);
  });
  it("danh sách cho script nạp có 3.5 Flash Lite ở cuối; nút trên web không có; model dự phòng cuối được dùng khi các model trước lỗi", async () => {
    expect(ASR_BATCH_MODELS.at(-1)).toBe("gemini:gemini-3.5-flash-lite");
    expect(ASR_MODELS).not.toContain("gemini:gemini-3.5-flash-lite");
    const tried: string[] = [];
    const chat = async (req: ChatRequest) => { tried.push(req.model); if (!req.model.includes("flash-lite")) throw new Error("Gemini 429"); return reply([["04:14", "04:18", "备用"]]); };
    expect(await transcribeChunkWithGemini(chat, "bR01vpXyItA", chunk, 600, ASR_BATCH_MODELS)).toEqual([{ text: "备用", start: 254, end: 258 }]);
    expect(tried).toEqual(ASR_BATCH_MODELS);
    tried.length = 0;
    await expect(transcribeChunkWithGemini(chat, "bR01vpXyItA", chunk, 600)).rejects.toThrow("429");
    expect(tried).toEqual(ASR_MODELS);
  });
});
