// Gọi thẳng API DeepSeek (không qua OpenRouter): đo thực tế nhanh và ổn định (~1-2s cho 1 lần phân tích đầy đủ),
// khác hẳn deepseek qua OpenRouter (dao động thất thường, có lúc >30s hoặc treo).
import { createCompatChat, type ChatFn } from "./groq-chat";

const ENDPOINT = "https://api.deepseek.com/chat/completions";

export const createDeepSeekChat = (apiKey: string, limits: { maxRetries?: number; maxWaitSec?: number } = {}): ChatFn =>
  createCompatChat({ endpoint: ENDPOINT, label: "DeepSeek", apiKey, params: () => ({}), ...limits });
