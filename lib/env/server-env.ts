import "server-only";
import { z } from "zod";

// Biến môi trường chỉ dùng ở server. Parse khi được gọi (không lúc build)
// để `next build` chạy được mà chưa cần đủ key.
const serverEnvSchema = z.object({
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  GROQ_API_KEY: z.string().min(1),
  FALLBACK_LLM_API_KEY: z.string().min(1).optional(),
  YOUTUBE_DATA_API_KEY: z.string().min(1),
  CAPTION_PROBE_SECRET: z.string().min(16).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}
