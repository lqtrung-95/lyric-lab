import { describe, expect, it, vi } from "vitest";
import { createChatRouter } from "./openrouter-chat";

const req = (model: string) => ({ model, system: "s", user: "u" });

describe("createChatRouter", () => {
  it("model thường đi Groq, tiền tố groq-fallback đi khóa Groq thứ hai, tiền tố openrouter đi OpenRouter — tên đã bỏ tiền tố", async () => {
    const groq = vi.fn().mockResolvedValue("g");
    const groqFallback = vi.fn().mockResolvedValue("g2");
    const or = vi.fn().mockResolvedValue("o");
    const chat = createChatRouter(groq, groqFallback, or);
    expect(await chat(req("openai/gpt-oss-120b"))).toBe("g");
    expect(await chat(req("groq-fallback:openai/gpt-oss-120b"))).toBe("g2");
    expect(groqFallback).toHaveBeenCalledWith(expect.objectContaining({ model: "openai/gpt-oss-120b" }));
    expect(await chat(req("openrouter:qwen/qwen3.7-flash"))).toBe("o");
    expect(or).toHaveBeenCalledWith(expect.objectContaining({ model: "qwen/qwen3.7-flash" }));
    expect(or).toHaveBeenCalledWith(expect.objectContaining({ maxTokens: 9000 }));
    expect(groq).toHaveBeenCalledTimes(1);
  });
  it("thiếu khóa tương ứng thì báo lỗi để pipeline thử model kế tiếp", async () => {
    await expect(createChatRouter(vi.fn())(req("openrouter:x/y"))).rejects.toThrow("OPENROUTER_API_KEY");
    await expect(createChatRouter(vi.fn())(req("groq-fallback:x/y"))).rejects.toThrow("FALLBACK_LLM_API_KEY");
  });
});

describe("withGroqFallback", () => {
  it("thêm tiền tố groq-fallback: cho từng model", async () => {
    const { withGroqFallback } = await import("./openrouter-chat");
    expect(withGroqFallback(["a", "b"])).toEqual(["groq-fallback:a", "groq-fallback:b"]);
  });
});
