// Gọi API Deploy (https://docs.deploy.com), tương thích OpenAI: `POST {base}/chat/completions`, khóa Bearer.
// Chỉ dùng cho script sinh nghĩa tiếng Việt hàng loạt (scripts/gloss-hsk-vocab.mts), không nằm trong chuỗi model của pipeline phân tích bài hát.
// `reasoning_effort: "none"` tắt bước "nghĩ" của model: nhanh và rẻ hơn nhiều cho việc dịch ngắn.
import { createCompatChat, type ChatFn } from "./groq-chat";

export const DEPLOY_ENDPOINT = "https://api-cdn.deploy.com/api/v1/chat/completions";
/** Tên model theo ví dụ trong tài liệu Deploy; đổi bằng biến môi trường DEPLOY_MODEL nếu tài khoản dùng tên khác (ví dụ `deepseek-ai/deepseek-v4.1-flash`). */
export const DEPLOY_DEFAULT_MODEL = "deepseek-ai/deepseek-v4.1-flash-1017";

export const createDeployChat = (apiKey: string, limits: { maxRetries?: number; maxWaitSec?: number; timeoutMs?: number } = {}): ChatFn =>
  createCompatChat({ endpoint: DEPLOY_ENDPOINT, label: "Deploy", apiKey, params: () => ({ reasoning_effort: "none" }), timeoutMs: 60_000, maxRetries: 4, maxWaitSec: 30, ...limits });
