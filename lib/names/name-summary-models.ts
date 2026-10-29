import { DEPLOY_DEFAULT_MODEL } from "@/lib/analysis/deploy-chat";
import { EXPLAIN_MODELS } from "@/lib/lookup/explain-term";

/**
 * Chuỗi model cho câu giải nghĩa tên: API Deploy đứng đầu (chất lượng ổn định, còn credit) khi có `DEPLOY_API_KEY`, rồi tới chuỗi giải nghĩa chung
 * (Gemini → Groq → BytePlus → OpenRouter). Thiếu khóa Deploy thì chỉ dùng chuỗi chung.
 */
export function nameSummaryModels(env: { DEPLOY_API_KEY?: string; DEPLOY_MODEL?: string }): string[] {
  return env.DEPLOY_API_KEY ? [`deploy:${env.DEPLOY_MODEL ?? DEPLOY_DEFAULT_MODEL}`, ...EXPLAIN_MODELS] : [...EXPLAIN_MODELS];
}
