import { createCompatChat, type ChatFn } from "./groq-chat";

/** Tiền tố trong danh sách model để chọn nhà cung cấp OpenRouter, vd. "openrouter:qwen/qwen3.7-flash". */
export const OPENROUTER_PREFIX = "openrouter:";
/** Tiền tố để gọi lại CÙNG model Groq nhưng bằng khóa Groq thứ hai (FALLBACK_LLM_API_KEY), vd. "groq-fallback:openai/gpt-oss-120b". */
export const GROQ_FALLBACK_PREFIX = "groq-fallback:";
/** Tiền tố cho model gọi thẳng API DeepSeek (không qua OpenRouter), vd. "deepseek:deepseek-chat". */
export const DEEPSEEK_PREFIX = "deepseek:";
/** Tiền tố cho model gọi API Gemini bằng khóa Google AI Studio (GEMINI_API_KEYS, có thể nhiều khóa), vd. "gemini:gemini-2.5-flash-lite". */
export const GEMINI_PREFIX = "gemini:";
/** Tiền tố cho model gọi API BytePlus ModelArk; model thật lấy từ BYTE_PLUS_MODEL_ID, chuỗi sau dấu ":" chỉ để đọc hiểu, vd. "byteplus:doubao". */
export const BYTEPLUS_PREFIX = "byteplus:";

const OPENROUTER_MAX_TOKENS = 9000;
// DeepSeek không có hạn mức token/phút chặt như Groq, cho trần rộng như OpenRouter để tránh cắt JSON ở bài dài.
const DEEPSEEK_MAX_TOKENS = 9000;
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Suy luận tối thiểu cho model có hỗ trợ (bỏ qua nếu model không có chế độ suy luận) để nhanh và rẻ. */
const params = (model: string) => (model.startsWith("openai/gpt-oss") ? { reasoning: { effort: "low" } } : { reasoning: { enabled: false } });

// Đã thử tăng timeout riêng cho OpenRouter (25s rồi 35s) để deepseek-chat-v3 kịp trả JSON lớn hơn, nhưng đo thực tế
// (xem A/B trong lịch sử) cho thấy model này qua OpenRouter chậm/dao động thất thường (có lần >30s hoặc treo) từ
// trước khi tăng số từ vựng, không liên quan prompt — cho thêm thời gian không giúp gì, chỉ trễ lúc rớt qua Groq.
// Quay lại dùng chung TIMEOUT_MS của Groq (rớt nhanh) thay vì chờ lâu vô ích.
export const createOpenRouterChat = (apiKey: string, limits: { maxRetries?: number; maxWaitSec?: number } = {}): ChatFn =>
  createCompatChat({ endpoint: ENDPOINT, label: "OpenRouter", apiKey, params, ...limits });

/** Áp tiền tố "groq-fallback:" cho các model Groq, để thử lại bằng FALLBACK_LLM_API_KEY trước khi sang OpenRouter. */
export const withGroqFallback = (models: string[]): string[] => models.map((m) => `${GROQ_FALLBACK_PREFIX}${m}`);

/**
 * Chọn nhà cung cấp theo tiền tố model: "openrouter:<model>" đi OpenRouter, "deepseek:<model>" gọi thẳng API
 * DeepSeek, "gemini:<model>" gọi Gemini bằng khóa Google AI Studio, "byteplus:<model>" gọi BytePlus ModelArk, "groq-fallback:<model>" đi Groq bằng khóa thứ hai, còn lại đi
 * Groq bằng khóa chính. Thiếu khóa tương ứng thì báo lỗi để pipeline bỏ qua và thử model kế tiếp.
 */
export function createChatRouter(groq: ChatFn, groqFallback?: ChatFn, openrouter?: ChatFn, deepseek?: ChatFn, byteplus?: ChatFn, gemini?: ChatFn): ChatFn {
  return (req) => {
    if (req.model.startsWith(OPENROUTER_PREFIX)) {
      if (!openrouter) return Promise.reject(new Error("Chưa cấu hình OPENROUTER_API_KEY"));
      // OpenRouter không có hạn mức token/phút như Groq nên cho trần đầu ra rộng: model văn phong dài (vd. Claude) bị cắt ở 4.500 token thì JSON hỏng.
      return openrouter({ ...req, model: req.model.slice(OPENROUTER_PREFIX.length), maxTokens: req.maxTokens ?? OPENROUTER_MAX_TOKENS });
    }
    if (req.model.startsWith(DEEPSEEK_PREFIX)) {
      if (!deepseek) return Promise.reject(new Error("Chưa cấu hình DEEPSEEK_API_KEY"));
      return deepseek({ ...req, model: req.model.slice(DEEPSEEK_PREFIX.length), maxTokens: req.maxTokens ?? DEEPSEEK_MAX_TOKENS });
    }
    if (req.model.startsWith(GEMINI_PREFIX)) {
      if (!gemini) return Promise.reject(new Error("Chưa cấu hình GEMINI_API_KEYS"));
      return gemini({ ...req, model: req.model.slice(GEMINI_PREFIX.length) });
    }
    if (req.model.startsWith(BYTEPLUS_PREFIX)) {
      if (!byteplus) return Promise.reject(new Error("Chưa cấu hình BYTE_PLUS_API_KEY/BYTE_PLUS_MODEL_ID"));
      return byteplus(req); // model thật đã khóa cứng trong createByteplusChat, không cần cắt tiền tố.
    }
    if (req.model.startsWith(GROQ_FALLBACK_PREFIX)) {
      if (!groqFallback) return Promise.reject(new Error("Chưa cấu hình FALLBACK_LLM_API_KEY"));
      return groqFallback({ ...req, model: req.model.slice(GROQ_FALLBACK_PREFIX.length) });
    }
    return groq(req);
  };
}
