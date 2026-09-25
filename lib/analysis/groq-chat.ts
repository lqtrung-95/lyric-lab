// Gọi Groq (API tương thích OpenAI). Chỉ dùng ở server: khóa nằm trong GROQ_API_KEY.
export interface ChatRequest {
  model: string;
  system: string;
  user: string;
}
export type ChatFn = (req: ChatRequest) => Promise<string>;

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 60_000;

// Tham số riêng cho từng họ model (suy luận ngắn để nhanh và rẻ).
function modelParams(model: string): Record<string, unknown> {
  if (model.startsWith("openai/gpt-oss")) return { reasoning_effort: "low" };
  if (model.startsWith("qwen/")) return { reasoning_effort: "none" };
  return {};
}

export function createGroqChat(apiKey: string, fetchFn: typeof fetch = fetch): ChatFn {
  return async ({ model, system, user }) => {
    const res = await fetchFn(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [{ role: "system", content: system }, { role: "user", content: user }],
        temperature: 0.3,
        max_completion_tokens: 8000,
        response_format: { type: "json_object" },
        ...modelParams(model),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!res.ok) throw new Error(`Groq ${model} lỗi HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
    const content = (await res.json()).choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content) throw new Error(`Groq ${model} trả nội dung rỗng`);
    return content;
  };
}
