import { describe, expect, it, vi } from "vitest";
import { createChatRouter } from "./openrouter-chat";

const req = (model: string) => ({ model, system: "s", user: "u" });

describe("createChatRouter", () => {
  it("model thường đi Groq, model tiền tố openrouter đi OpenRouter với tên đã bỏ tiền tố", async () => {
    const groq = vi.fn().mockResolvedValue("g");
    const or = vi.fn().mockResolvedValue("o");
    const chat = createChatRouter(groq, or);
    expect(await chat(req("openai/gpt-oss-120b"))).toBe("g");
    expect(await chat(req("openrouter:qwen/qwen3.7-flash"))).toBe("o");
    expect(or).toHaveBeenCalledWith(expect.objectContaining({ model: "qwen/qwen3.7-flash" }));
    expect(or).toHaveBeenCalledWith(expect.objectContaining({ maxTokens: 9000 }));
    expect(groq).toHaveBeenCalledTimes(1);
  });
  it("thiếu khóa OpenRouter thì báo lỗi để pipeline thử model kế tiếp", async () => {
    await expect(createChatRouter(vi.fn())(req("openrouter:x/y"))).rejects.toThrow("OPENROUTER_API_KEY");
  });
});
