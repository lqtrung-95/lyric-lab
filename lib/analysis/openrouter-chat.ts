import { createCompatChat, type ChatFn } from "./groq-chat";

/** Tiền tố trong danh sách model để chọn nhà cung cấp OpenRouter, vd. "openrouter:qwen/qwen3.7-flash". */
export const OPENROUTER_PREFIX = "openrouter:";
/** Tiền tố để gọi lại CÙNG model Groq nhưng bằng khóa Groq thứ hai (FALLBACK_LLM_API_KEY), vd. "groq-fallback:openai/gpt-oss-120b". */
export const GROQ_FALLBACK_PREFIX = "groq-fallback:";

const OPENROUTER_MAX_TOKENS = 9000;
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Suy luận tối thiểu cho model có hỗ trợ (bỏ qua nếu model không có chế độ suy luận) để nhanh và rẻ. */
const params = (model: string) => (model.startsWith("openai/gpt-oss") ? { reasoning: { effort: "low" } } : { reasoning: { enabled: false } });

export const createOpenRouterChat = (apiKey: string, limits: { maxRetries?: number; maxWaitSec?: number } = {}): ChatFn =>
  createCompatChat({ endpoint: ENDPOINT, label: "OpenRouter", apiKey, params, ...limits });

/** Áp tiền tố "groq-fallback:" cho các model Groq, để thử lại bằng FALLBACK_LLM_API_KEY trước khi sang OpenRouter. */
export const withGroqFallback = (models: string[]): string[] => models.map((m) => `${GROQ_FALLBACK_PREFIX}${m}`);

/**
 * Chọn nhà cung cấp theo tiền tố model: "openrouter:<model>" đi OpenRouter, "groq-fallback:<model>" đi Groq
 * bằng khóa thứ hai, còn lại đi Groq bằng khóa chính. Thiếu khóa tương ứng thì báo lỗi để pipeline bỏ qua và thử model kế tiếp.
 */
export function createChatRouter(groq: ChatFn, groqFallback?: ChatFn, openrouter?: ChatFn): ChatFn {
  return (req) => {
    if (req.model.startsWith(OPENROUTER_PREFIX)) {
      if (!openrouter) return Promise.reject(new Error("Chưa cấu hình OPENROUTER_API_KEY"));
      // OpenRouter không có hạn mức token/phút như Groq nên cho trần đầu ra rộng: model văn phong dài (vd. Claude) bị cắt ở 4.500 token thì JSON hỏng.
      return openrouter({ ...req, model: req.model.slice(OPENROUTER_PREFIX.length), maxTokens: req.maxTokens ?? OPENROUTER_MAX_TOKENS });
    }
    if (req.model.startsWith(GROQ_FALLBACK_PREFIX)) {
      if (!groqFallback) return Promise.reject(new Error("Chưa cấu hình FALLBACK_LLM_API_KEY"));
      return groqFallback({ ...req, model: req.model.slice(GROQ_FALLBACK_PREFIX.length) });
    }
    return groq(req);
  };
}
