import { describe, expect, it } from "vitest";
import type { PreparedLine } from "./build-lesson-lines";
import { modelTimeoutMs, VIDEO_TRANSLATION_CONCURRENCY, VIDEO_TRANSLATION_MODELS, VIDEO_TRANSLATION_QUALITY_MODELS, translateLines } from "./translate-lines";

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
  it("Gemini 3 Flash đứng đầu, rồi Gemini 2.5 Flash, Groq khóa thứ hai, DeepSeek, OpenRouter làm dự phòng; không dùng alias -latest", () => {
    expect(VIDEO_TRANSLATION_MODELS[0]).toBe("gemini:gemini-3-flash-preview");
    expect(VIDEO_TRANSLATION_MODELS[1]).toBe("gemini:gemini-2.5-flash");
    expect(VIDEO_TRANSLATION_MODELS.some((m) => m.endsWith("-latest"))).toBe(false);
    expect(VIDEO_TRANSLATION_MODELS[2]).toBe("groq-fallback:openai/gpt-oss-120b");
    expect(VIDEO_TRANSLATION_MODELS[3]).toBe("deepseek:deepseek-chat");
    expect(VIDEO_TRANSLATION_MODELS.at(-1)).toMatch(/^openrouter:/);
  });
  it("chuỗi chất lượng dùng chung chuỗi dịch (mức suy nghĩ do gemini-chat quyết định theo model)", () => {
    expect(VIDEO_TRANSLATION_QUALITY_MODELS).toEqual(VIDEO_TRANSLATION_MODELS);
  });
  it("8 đoạn dịch song song để video vài trăm câu kịp ngân sách thời gian", () => {
    expect(VIDEO_TRANSLATION_CONCURRENCY).toBe(8);
  });
});

describe("translateLines với chuỗi model mặc định", () => {
  it("Groq lỗi (hết hạn mức) thì dòng được dịch bởi model kế tiếp", async () => {
    const seen: string[] = [];
    const chat = async ({ model }: { model: string }) => {
      seen.push(model);
      if (model.startsWith("gemini:") || model.startsWith("groq-fallback:")) throw new Error("429");
      return JSON.stringify({ translations: [{ lineIndex: 0, vi: "Xin chào" }] });
    };
    const out = await translateLines([line("你好")], chat);
    expect(out[0].translation).toBe("Xin chào");
    expect(seen).toEqual(["gemini:gemini-3-flash-preview", "gemini:gemini-2.5-flash", "groq-fallback:openai/gpt-oss-120b", "deepseek:deepseek-chat"].slice(0, seen.length));
    expect(seen.at(-1)).toBe("deepseek:deepseek-chat");
  });

  it("prompt kèm tiêu đề video, các dòng liền trước/sau làm ngữ cảnh (không dịch), và nói rõ đây là lời thoại video", async () => {
    const prompts: { system: string; user: string }[] = [];
    const chat = async (r: { system: string; user: string }) => { prompts.push(r); return JSON.stringify({ translations: [{ lineIndex: 2, vi: "x" }] }); };
    await translateLines([line("一", "đã dịch 1"), line("二", "đã dịch 2"), line("三"), line("四", "đã dịch 4")], chat, ["m"], { title: "Vlog ngày nghỉ" });
    expect(prompts).toHaveLength(1);
    expect(prompts[0].system).toContain("lời thoại video");
    expect(prompts[0].user).toContain("Tiêu đề video: Vlog ngày nghỉ");
    expect(prompts[0].user).toMatch(/CÁC DÒNG LIỀN TRƯỚC[^\n]*\n一\n二/);
    expect(prompts[0].user).toMatch(/CÁC DÒNG CẦN DỊCH[^\n]*\n2\t三/);
    expect(prompts[0].user).toMatch(/CÁC DÒNG LIỀN SAU[^\n]*\n四/);
  });

  it("chuỗi chất lượng thử Gemini 3 Flash trước", async () => {
    const seen: string[] = [];
    const chat = async ({ model }: { model: string }) => { seen.push(model); return JSON.stringify({ translations: [{ lineIndex: 0, vi: "ok" }] }); };
    await translateLines([line("你好")], chat, VIDEO_TRANSLATION_QUALITY_MODELS);
    expect(seen).toEqual(["gemini:gemini-3-flash-preview"]);
  });
});

describe("thời gian chờ theo model", () => {
  it("model Gemini chờ ngắn (12–15 giây) để model quá tải bị bỏ qua sớm", () => {
    expect(modelTimeoutMs("gemini:gemini-3-flash-preview")).toBe(15_000);
    expect(modelTimeoutMs("gemini:gemini-2.5-flash")).toBe(12_000);
    expect(modelTimeoutMs("groq-fallback:openai/gpt-oss-120b")).toBe(15_000);
    expect(modelTimeoutMs("deepseek:deepseek-chat")).toBe(25_000);
  });
  it("mỗi lần gọi nhận đúng hạn chót của model đó; Gemini 3 Flash lỗi thì sang 2.5 Flash", async () => {
    const calls: [string, number | undefined][] = [];
    const chat = async ({ model, timeoutMs }: { model: string; timeoutMs?: number }) => {
      calls.push([model, timeoutMs]);
      if (model === "gemini:gemini-3-flash-preview") throw new Error("Gemini 503");
      return JSON.stringify({ translations: [{ lineIndex: 0, vi: "Xin chào" }] });
    };
    const out = await translateLines([line("你好")], chat);
    expect(out[0].translation).toBe("Xin chào");
    expect(calls).toEqual([["gemini:gemini-3-flash-preview", 15_000], ["gemini:gemini-2.5-flash", 12_000]]);
  });
});
