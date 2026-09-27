import { createCompatChat, type ChatFn } from "./groq-chat";

/** Tiền tố trong danh sách model để chọn nhà cung cấp OpenRouter, vd. "openrouter:qwen/qwen3.7-flash". */
export const OPENROUTER_PREFIX = "openrouter:";

const OPENROUTER_MAX_TOKENS = 9000;
const ENDPOINT = "https://openrouter.ai/api/v1/chat/completions";

/** Suy luận tối thiểu cho model có hỗ trợ (bỏ qua nếu model không có chế độ suy luận) để nhanh và rẻ. */
const params = (model: string) => (model.startsWith("openai/gpt-oss") ? { reasoning: { effort: "low" } } : { reasoning: { enabled: false } });

export const createOpenRouterChat = (apiKey: string): ChatFn => createCompatChat({ endpoint: ENDPOINT, label: "OpenRouter", apiKey, params });

/**
 * Chọn nhà cung cấp theo tiền tố model: "openrouter:<model>" đi OpenRouter, còn lại đi Groq.
 * Không có khóa OpenRouter thì model tiền tố openrouter báo lỗi để pipeline bỏ qua và thử model kế tiếp.
 */
export function createChatRouter(groq: ChatFn, openrouter?: ChatFn): ChatFn {
  return (req) => {
    if (!req.model.startsWith(OPENROUTER_PREFIX)) return groq(req);
    if (!openrouter) return Promise.reject(new Error("Chưa cấu hình OPENROUTER_API_KEY"));
    // OpenRouter không có hạn mức token/phút như Groq nên cho trần đầu ra rộng: model văn phong dài (vd. Claude) bị cắt ở 4.500 token thì JSON hỏng.
    return openrouter({ ...req, model: req.model.slice(OPENROUTER_PREFIX.length), maxTokens: req.maxTokens ?? OPENROUTER_MAX_TOKENS });
  };
}
