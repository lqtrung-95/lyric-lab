// Người học báo một dòng dịch sai ở video. Dòng đang dùng bản dịch có sẵn (phụ đề người làm) thì nhờ AI dịch lại NGAY dòng đó (rẻ, người báo thấy
// kết quả liền); dòng vốn đã là bản AI hoặc đã được admin xác nhận thì chỉ ghi nhận cho quản trị, tránh vòng lặp AI dịch lại chính nó và người phá bản đã xác nhận.
export const MAX_TRANSLATION_REPORTS_PER_USER_PER_DAY = 20;
/** Trần chung số lần AI dịch lại trong 24 giờ (chặn việc bấm báo hàng loạt để đốt hạn mức LLM). */
export const MAX_AI_RETRANSLATIONS_PER_DAY = 200;

export type ReportDecision = "retranslate" | "escalate" | "duplicate" | "user_limit";

export interface ReportContext {
  /** Người này đã báo đúng dòng này rồi. */
  alreadyReportedByUser: boolean;
  /** Số báo cáo của người này trong 24 giờ qua. */
  userReportsToday: number;
  /** Số lần AI đã dịch lại (toàn hệ thống) trong 24 giờ qua. */
  aiRetranslationsToday: number;
  /** Không cho AI dịch lại dòng này: đã là bản AI (lần dịch lại trước, hoặc cả video do AI dịch) hoặc admin đã sửa/khôi phục. */
  lineLockedFromAi: boolean;
}

export function decideReportAction(c: ReportContext): ReportDecision {
  if (c.alreadyReportedByUser) return "duplicate";
  if (c.userReportsToday >= MAX_TRANSLATION_REPORTS_PER_USER_PER_DAY) return "user_limit";
  if (c.lineLockedFromAi || c.aiRetranslationsToday >= MAX_AI_RETRANSLATIONS_PER_DAY) return "escalate";
  return "retranslate";
}
