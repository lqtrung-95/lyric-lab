import "server-only";
import { z } from "zod";

// Biến môi trường chỉ dùng ở server. Parse khi được gọi (không lúc build)
// để `next build` chạy được mà chưa cần đủ key.
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  // Khóa Groq thứ hai, thử trước khi sang OpenRouter (cùng gói miễn phí Groq nhưng đếm hạn mức riêng).
  FALLBACK_LLM_API_KEY: z.string().min(1).optional(),
  // Dự phòng cuối khi cả hai khóa Groq hết hạn mức: model có tiền tố "openrouter:" trong DEFAULT_MODELS.
  OPENROUTER_API_KEY: z.string().min(1).optional(),
  YOUTUBE_DATA_API_KEY: z.string().min(1),
  // Giọng đọc thần kinh (Azure Speech). Bỏ trống thì /api/tts trả 503 và nút loa dùng giọng hệ thống.
  AZURE_SPEECH_KEY: z.string().min(1).optional(),
  AZURE_SPEECH_REGION: z.string().min(1).optional(),
  CAPTION_PROBE_SECRET: z.string().min(16).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

// Nhiều công cụ (dotenv, Vercel) để một biến chưa điền dưới dạng chuỗi rỗng thay vì bỏ hẳn key.
// Coi chuỗi rỗng như "chưa đặt" để các biến optional không bị lỗi min(1)/min(16) chỉ vì trống.
function dropEmptyValues(env: NodeJS.ProcessEnv): Record<string, string> {
  return Object.fromEntries(Object.entries(env).filter(([, v]) => v !== undefined && v !== "")) as Record<string, string>;
}

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(dropEmptyValues(process.env));
}
