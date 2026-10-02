// Gọi thẳng API DeepSeek (không qua OpenRouter): đo thực tế nhanh và ổn định (~1-2s cho 1 lần phân tích đầy đủ),
// khác hẳn deepseek qua OpenRouter (dao động thất thường, có lúc >30s hoặc treo — xem openrouter-chat.ts, KHÔNG
// áp timeout riêng cho OpenRouter vì độ trễ của nó bất định, tăng không giúp gì).
import { createCompatChat, type ChatFn } from "./groq-chat";

const ENDPOINT = "https://api.deepseek.com/chat/completions";
// Bài dài (100+ dòng, 50+ ứng viên) có lúc gần chạm trần 15s mặc định của Groq (đo thật ~15.0s cho 1 bài 113 dòng) —
// khác dạng với OpenRouter, đây là lố NHẸ và ổn định nên nới thêm cho đủ dư là hợp lý, không phải "chờ vô ích".
const TIMEOUT_MS = 25_000;

export const createDeepSeekChat = (apiKey: string, limits: { maxRetries?: number; maxWaitSec?: number } = {}): ChatFn =>
  createCompatChat({ endpoint: ENDPOINT, label: "DeepSeek", apiKey, params: () => ({}), timeoutMs: TIMEOUT_MS, ...limits });
