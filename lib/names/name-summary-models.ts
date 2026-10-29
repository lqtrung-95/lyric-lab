import { DEPLOY_DEFAULT_MODEL } from "@/lib/analysis/deploy-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";

/** Model dự phòng chất lượng tốt (đo ngày 29/10: câu sạch, ~1–2 giây) dùng sau Deploy; các model nhỏ trong chuỗi chung đôi khi trả từ vô nghĩa nên không dùng ở đây. */
const STRONG_FALLBACK = "openrouter:google/gemini-2.5-flash";

/**
 * Chuỗi model cho câu giải nghĩa tên. Có `DEPLOY_API_KEY`: Deploy đứng đầu rồi chỉ một model dự phòng mạnh (hết đó thì dùng câu liệt kê nghĩa, tốt hơn câu vô nghĩa
 * của model yếu và không kéo dài chờ qua cả chuỗi dài). Thiếu khóa Deploy thì dùng chuỗi giải nghĩa chung.
 */
export function nameSummaryModels(env: { DEPLOY_API_KEY?: string; DEPLOY_MODEL?: string }): string[] {
  return env.DEPLOY_API_KEY ? [`deploy:${env.DEPLOY_MODEL ?? DEPLOY_DEFAULT_MODEL}`, STRONG_FALLBACK] : [...EXPLAIN_MODELS];
}
