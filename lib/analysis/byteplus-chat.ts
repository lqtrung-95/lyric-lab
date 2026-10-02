// Gọi API BytePlus ModelArk (tương thích OpenAI) — xem docs.byteplus.com/docs/ModelArk. ModelArk cần model/endpoint
// ID thật từ console BytePlus (vd. "doubao-seed-1-6-flash" hoặc "ep-xxxxxxxx"), gắn với tài khoản nên không
// hardcode trong danh sách model (EXPLAIN_MODELS) được — client này khóa cứng theo `modelId` truyền vào từ biến môi
// trường BYTE_PLUS_MODEL_ID (server-env.ts), bỏ qua model string của request gọi tới (chỉ dùng tiền tố "byteplus:"
// làm điểm đánh dấu router, xem openrouter-chat.ts).
import { createCompatChat, type ChatFn } from "./groq-chat";

const ENDPOINT = "https://ark.ap-southeast.bytepluses.com/api/v3/chat/completions";

export const createByteplusChat = (apiKey: string, modelId: string, limits: { maxRetries?: number; maxWaitSec?: number } = {}): ChatFn => {
  const chat = createCompatChat({ endpoint: ENDPOINT, label: "BytePlus", apiKey, params: () => ({}), ...limits });
  return (req) => chat({ ...req, model: modelId });
};
