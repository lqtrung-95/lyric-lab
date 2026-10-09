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
  // DeepSeek gọi thẳng API của họ (không qua OpenRouter): đo thực tế nhanh (~1-2s), ổn định hơn hẳn deepseek qua
  // OpenRouter (dao động, có lúc >30s/treo — xem lịch sử) nên để model chính nếu có khóa.
  DEEPSEEK_API_KEY: z.string().min(1).optional(),
  // BytePlus ModelArk, dùng cho giải nghĩa từ/câu khi người dùng bấm (EXPLAIN_MODELS trong lib/lookup/explain-term.ts),
  // không dùng cho pipeline phân tích bài hát. BYTE_PLUS_MODEL_ID là model/endpoint ID thật từ console BytePlus
  // (vd. "doubao-seed-1-6-flash" hoặc "ep-xxxxxxxx") — gắn với tài khoản nên không hardcode được, thiếu 1 trong 2
  // biến này thì tính năng vẫn chạy bình thường (bỏ qua BytePlus, dùng các model khác).
  BYTE_PLUS_API_KEY: z.string().min(1).optional(),
  BYTE_PLUS_MODEL_ID: z.string().min(1).optional(),
  YOUTUBE_DATA_API_KEY: z.string().min(1),
  // Khóa Google AI Studio (Gemini API), nhiều khóa ngăn cách bằng dấu phẩy hoặc xuống dòng: dùng đầu tiên cho giải nghĩa từ/câu khi bấm và dịch lại dòng video bị báo sai.
  GEMINI_API_KEYS: z.string().min(1).optional(),
  // Đổi model Gemini (mặc định gemini-2.5-flash-lite), xem lib/analysis/gemini-models.ts.
  GEMINI_MODEL: z.string().min(1).optional(),
  // Dịch vụ lấy phụ đề tiếng Trung của video YouTube (Supadata) cho người dùng dán link mà không có phụ đề đi kèm. Bỏ trống thì chỉ nhận phụ đề dán vào/bookmarklet.
  SUPADATA_API_KEY: z.string().min(1).optional(),
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
