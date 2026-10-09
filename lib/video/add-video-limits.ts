// Giới hạn khi người dùng tự thêm video vào kho dùng chung (mỗi video tốn một lượt gọi dịch LLM và có thể một credit Supadata).
export const MAX_VIDEOS_PER_USER_PER_DAY = 3;
/** Trần chung mọi người trong 24 giờ: chặn việc tạo hàng loạt tài khoản ẩn danh để lách giới hạn từng người. */
export const MAX_USER_VIDEOS_PER_DAY_TOTAL = 100;
/** Video quá dài làm dịch vượt thời gian của route và tốn kém; podcast dài hơn một giờ chưa hỗ trợ. */
export const MAX_ADDED_VIDEO_SECONDS = 60 * 60;
/** Video quá ngắn (Shorts, đoạn chào) không đủ câu để luyện. */
export const MIN_ADDED_VIDEO_SECONDS = 30;

export type AddLimitDecision = "ok" | "user_limit" | "global_limit";

/** Quyết định từ số video đã thêm trong 24 giờ qua: của người này và của tất cả. Tài khoản admin không bị hai giới hạn này (chỉ bị giới hạn độ dài video và ngân sách AI dịch). */
export function decideAddLimit(userCount: number, totalCount: number, isAdmin = false): AddLimitDecision {
  if (isAdmin) return "ok";
  if (totalCount >= MAX_USER_VIDEOS_PER_DAY_TOTAL) return "global_limit";
  if (userCount >= MAX_VIDEOS_PER_USER_PER_DAY) return "user_limit";
  return "ok";
}

export type DurationDecision = "ok" | "too_short" | "too_long";

export function decideDuration(durationSec: number): DurationDecision {
  if (durationSec > MAX_ADDED_VIDEO_SECONDS) return "too_long";
  if (durationSec < MIN_ADDED_VIDEO_SECONDS) return "too_short";
  return "ok";
}

/**
 * Ngân sách AI dịch toàn app trong 24 giờ, tính theo tổng số PHÚT video (không theo số video: 100 video 60 phút tốn gấp ba 100 video 20 phút).
 * Khoảng 60 video 20 phút/ngày. Hết ngân sách thì video vẫn được thêm nhưng chưa dịch (chép chính tả và shadowing không cần bản dịch),
 * admin dịch bù sau. Video dùng phụ đề tiếng Việt có sẵn không tốn AI nên không tính vào ngân sách.
 */
export const AI_TRANSLATION_MINUTES_PER_DAY = 1200;

export type TranslationBudgetDecision = "ok" | "exhausted";

/** `usedMinutes`: tổng phút video đã được AI dịch trong 24 giờ qua; `videoSeconds`: video sắp thêm. Vừa đủ ngân sách vẫn tính là ok. */
export function decideTranslationBudget(usedMinutes: number, videoSeconds: number): TranslationBudgetDecision {
  return usedMinutes + videoSeconds / 60 <= AI_TRANSLATION_MINUTES_PER_DAY ? "ok" : "exhausted";
}
