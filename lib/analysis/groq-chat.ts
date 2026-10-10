// Gọi Groq (API tương thích OpenAI). Chỉ dùng ở server: khóa nằm trong GROQ_API_KEY.
export interface ChatRequest {
  model: string;
  system: string;
  user: string;
  /** Trần token đầu ra; Groq tính giá trị này vào hạn mức token/phút nên yêu cầu ngắn nên đặt thấp. */
  maxTokens?: number;
  /** Hạn chót một lần gọi (ms) của nhà cung cấp hỗ trợ (hiện chỉ Gemini). Model "suy nghĩ" dịch 30 dòng mất ~15 giây nên cần nới hơn mặc định. */
  timeoutMs?: number;
  /** Đoạn âm thanh đính kèm cho model nghe được (hiện chỉ Gemini; `data` là base64, định dạng WAV/MP3/AAC/OGG/FLAC). */
  audio?: { mimeType: string; data: string };
}
export type ChatFn = (req: ChatRequest) => Promise<string>;

const ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
// Route /api/analyze có maxDuration 60s (trần của gói Vercel Hobby) và có thể thử tới 6 model tuần tự khi model
// trước lỗi/nghèo kết quả (xem DEFAULT_MODELS) — timeout 1 lần gọi phải NHỎ hơn nhiều so với 60s, nếu không 1 model
// chậm/treo là chiếm hết cả ngân sách, không còn thời gian rớt qua model dự phòng nào (từng xảy ra thật). Dùng
// chung cho cả Groq và OpenRouter (openrouter-chat.ts) — deepseek qua OpenRouter đo thực tế dao động/chậm thất
// thường (có lần >30s), nới timeout riêng cho nó không giúp gì, chỉ trễ lúc rớt qua model dự phòng.
const TIMEOUT_MS = 15_000;
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
  /** Trần thời gian 1 lần gọi; mặc định TIMEOUT_MS (xem ghi chú ở hằng số). */
  timeoutMs?: number;
  fetchFn?: typeof fetch;
  sleep?: (ms: number) => Promise<void>;
}

/** Gỡ khối mã markdown (```json ... ```) mà một số model (vd. Claude) bọc quanh JSON dù đã yêu cầu chỉ trả JSON. */
export function stripCodeFence(content: string): string {
  const m = content.trim().match(/^```[a-zA-Z]*\s*\n?([\s\S]*?)\n?```$/);
  return m ? m[1].trim() : content;
}

/** Client chat cho API tương thích OpenAI (Groq, OpenRouter): tự chờ và thử lại khi bị giới hạn 429. */
export function createCompatChat(opts: CompatChatOptions): ChatFn {
  const { endpoint, label, apiKey, maxRetries = MAX_RATE_LIMIT_RETRIES, maxWaitSec = MAX_WAIT_SEC, timeoutMs = TIMEOUT_MS, params = modelParams, fetchFn = fetch, sleep = (ms) => new Promise<void>((r) => setTimeout(r, ms)) } = opts;
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
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (res.status === 429 && attempt < maxRetries) {
        await sleep(rateLimitWaitSeconds(res.headers, await res.text(), maxWaitSec) * 1000);
        continue;
      }
      if (!res.ok) throw new Error(`${label} ${model} lỗi HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const content = (await res.json()).choices?.[0]?.message?.content;
      if (typeof content !== "string" || !content) throw new Error(`${label} ${model} trả nội dung rỗng`);
      return stripCodeFence(content);
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
