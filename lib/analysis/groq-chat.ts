// Gọi Groq (API tương thích OpenAI). Chỉ dùng ở server: khóa nằm trong GROQ_API_KEY.
export interface ChatRequest {
  model: string;
  system: string;
  user: string;
  /** Trần token đầu ra; Groq tính giá trị này vào hạn mức token/phút nên yêu cầu ngắn nên đặt thấp. */
  maxTokens?: number;
}
export type ChatFn = (req: ChatRequest) => Promise<string>;

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const TIMEOUT_MS = 60_000;
// Groq tính max_completion_tokens vào hạn mức token/phút (gói miễn phí: 8.000). Đặt vừa đủ cho một phân tích
// (~3k token đầu ra) để một lần gọi không chiếm hết hạn mức.
const MAX_COMPLETION_TOKENS = 4500;
const MAX_RATE_LIMIT_RETRIES = 3;
const MAX_WAIT_SEC = 60;

// Tham số riêng cho từng họ model (suy luận ngắn để nhanh và rẻ).
function modelParams(model: string): Record<string, unknown> {
  if (model.startsWith("openai/gpt-oss")) return { reasoning_effort: "low" };
  if (model.startsWith("qwen/")) return { reasoning_effort: "none" };
  return {};
}

/** Số giây nên chờ sau lỗi 429: header retry-after hoặc câu "try again in 5.5s" / "1m2s" trong nội dung lỗi. */
export function rateLimitWaitSeconds(headers: Headers, body: string): number {
  const header = Number(headers.get("retry-after"));
  if (header > 0) return Math.min(header, MAX_WAIT_SEC);
  const m = body.match(/try again in (?:(\d+)m)?(?:([\d.]+)s)?/i);
  const sec = m ? Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0) : 0;
  return Math.min(sec > 0 ? sec + 0.5 : 10, MAX_WAIT_SEC);
}

export function createGroqChat(
  apiKey: string,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
): ChatFn {
  return async ({ model, system, user, maxTokens = MAX_COMPLETION_TOKENS }) => {
    for (let attempt = 0; ; attempt++) {
      const res = await fetchFn(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: 0.3,
          max_completion_tokens: maxTokens,
          response_format: { type: "json_object" },
          ...modelParams(model),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 429 && attempt < MAX_RATE_LIMIT_RETRIES) {
        await sleep(rateLimitWaitSeconds(res.headers, await res.text()) * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`Groq ${model} lỗi HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const content = (await res.json()).choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content) throw new Error(`Groq ${model} trả nội dung rỗng`);
      return content;
    }
  };
}
