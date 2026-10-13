import "server-only";
import type { CurrentUser } from "@/lib/auth/current-user";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { translateMissingLessonLines, type TranslateMissingResult } from "./admin-translate-missing";
import { acquireTranslateLock, releaseTranslateLock } from "./translate-lock";

/** Mỗi lượt người học bấm dịch tối đa chừng này (cộng với hạn chót một đoạn ~25 giây vẫn dưới 60 giây của route). */
const USER_TRANSLATE_BUDGET_MS = 18_000;

export type UserTranslateOutcome =
  | ({ kind: "progress" } & TranslateMissingResult)
  | { kind: "busy" }
  | { kind: "user_limit" }
  | { kind: "not_found" }
  | { kind: "ai_unavailable"; remaining: number };

/**
 * Người học dịch bù các câu còn trống của một video bằng AI. Thứ tự: giành khóa video (không ai khác đang dịch) → trừ một lượt hạn mức `translate`
 * → dịch trong ngân sách thời gian → nhả khóa. Không điền được câu nào dù còn câu trống nghĩa là AI đang quá tải: hoàn lại lượt hạn mức.
 */
export async function translateMissingForUser(user: CurrentUser, videoId: string): Promise<UserTranslateOutcome> {
  const lock = await acquireTranslateLock(videoId);
  if (lock === "not_found") return { kind: "not_found" };
  if (lock === "busy") return { kind: "busy" };
  let consumed = false;
  try {
    if (!(await consumeUsage(user, "translate"))) return { kind: "user_limit" };
    consumed = true;
    const result = await translateMissingLessonLines(videoId, { timeBudgetMs: USER_TRANSLATE_BUDGET_MS });
    if (result === "not_found") { await refundUsage(user, "translate"); return { kind: "not_found" }; }
    if (result.translated === 0 && result.remaining > 0) { await refundUsage(user, "translate"); return { kind: "ai_unavailable", remaining: result.remaining }; }
    return { kind: "progress", ...result };
  } catch (error) {
    if (consumed) await refundUsage(user, "translate");
    throw error;
  } finally {
    await releaseTranslateLock(videoId);
  }
}
