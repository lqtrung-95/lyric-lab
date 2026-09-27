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
export function rateLimitWaitSeconds(headers: Headers, body: string, maxWaitSec = MAX_WAIT_SEC): number {
  const header = Number(headers.get("retry-after"));
  if (header > 0) return Math.min(header, maxWaitSec);
  const m = body.match(/try again in (?:(\d+)m)?(?:([\d.]+)s)?/i);
  const sec = m ? Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0) : 0;
  return Math.min(sec > 0 ? sec + 0.5 : 10, maxWaitSec);
}

export interface CompatChatOptions {
  endpoint: string;
  label: string;
  apiKey: string;
  /** Tham số riêng theo model (mặc định: suy luận ngắn cho gpt-oss/qwen của Groq). */
  params?: (model: string) => Record<string, unknown>;
  /** Số lần thử lại khi 429 và thời gian chờ tối đa mỗi lần; đặt thấp khi có nhà cung cấp dự phòng để chuyển sang sớm. */
  maxRetries?: number;
  maxWaitSec?: number;
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

/** Client chat cho API tương thích OpenAI (Groq, OpenRouter): tự chờ và thử lại khi bị giới hạn 429. */
export function createCompatChat(opts: CompatChatOptions): ChatFn {
  const { endpoint, label, apiKey, maxRetries = MAX_RATE_LIMIT_RETRIES, maxWaitSec = MAX_WAIT_SEC, params = modelParams, fetchFn = fetch, sleep = (ms) => new Promise<void>((r) => setTimeout(r, ms)) } = opts;
  return async ({ model, system, user, maxTokens = MAX_COMPLETION_TOKENS }) => {
    for (let attempt = 0; ; attempt++) {
      const res = await fetchFn(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model,
          messages: [{ role: "system", content: system }, { role: "user", content: user }],
          temperature: 0.3,
          max_completion_tokens: maxTokens,
          response_format: { type: "json_object" },
          ...params(model),
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (res.status === 429 && attempt < maxRetries) {
        await sleep(rateLimitWaitSeconds(res.headers, await res.text(), maxWaitSec) * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`${label} ${model} lỗi HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const content = (await res.json()).choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content) throw new Error(`${label} ${model} trả nội dung rỗng`);
      return content;
    }
  };
}

export function createGroqChat(
  apiKey: string,
  fetchFn: typeof fetch = fetch,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((r) => setTimeout(r, ms)),
  limits: { maxRetries?: number; maxWaitSec?: number } = {},
): ChatFn {
  return createCompatChat({ endpoint: ENDPOINT, label: "Groq", apiKey, fetchFn, sleep, ...limits });
}
