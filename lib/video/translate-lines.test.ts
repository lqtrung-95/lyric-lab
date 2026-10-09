import { describe, expect, it } from "vitest";
import type { PreparedLine } from "./build-lesson-lines";
import { VIDEO_TRANSLATION_MODELS, translateLines } from "./translate-lines";

const line = (text: string, translation: string | null = null): PreparedLine => ({ text, start: 0, end: 1, tokens: [], translation } as unknown as PreparedLine);

describe("translateLines", () => {
  it("điền bản dịch theo thứ tự dòng và giữ dòng đã có bản dịch", async () => {
    const chat = async () => JSON.stringify({ translations: [{ lineIndex: 0, vi: "Xin chào" }, { lineIndex: 2, vi: "Tạm biệt" }] });
    const out = await translateLines([line("你好"), line("谢谢", "Cảm ơn"), line("再见")], chat, ["m"]);
    expect(out.map((l) => l.translation)).toEqual(["Xin chào", "Cảm ơn", "Tạm biệt"]);
  });

  it("model lỗi thì giữ translation null, không ném lỗi", async () => {
    const chat = async () => { throw new Error("hết hạn mức"); };
    const out = await translateLines([line("你好")], chat, ["m"]);
    expect(out.map((l) => l.translation)).toEqual([null]);
  });
});

describe("VIDEO_TRANSLATION_MODELS", () => {
  it("Groq khóa thứ hai đứng đầu (miễn phí, hạn mức riêng), DeepSeek rồi OpenRouter làm dự phòng", () => {
    expect(VIDEO_TRANSLATION_MODELS[0]).toBe("groq-fallback:openai/gpt-oss-120b");
    expect(VIDEO_TRANSLATION_MODELS[1]).toBe("deepseek:deepseek-chat");
    expect(VIDEO_TRANSLATION_MODELS.at(-1)).toMatch(/^openrouter:/);
  });
});

describe("translateLines với chuỗi model mặc định", () => {
  it("Groq lỗi (hết hạn mức) thì dòng được dịch bởi model kế tiếp", async () => {
    const seen: string[] = [];
    const chat = async ({ model }: { model: string }) => {
      seen.push(model);
      if (model.startsWith("groq-fallback:")) throw new Error("429");
      return JSON.stringify({ translations: [{ lineIndex: 0, vi: "Xin chào" }] });
    };
    const out = await translateLines([line("你好")], chat);
    expect(out[0].translation).toBe("Xin chào");
    expect(seen).toEqual(["groq-fallback:openai/gpt-oss-120b", "deepseek:deepseek-chat"]);
  });
});
