// Giới hạn khi người dùng tự thêm video vào kho dùng chung (mỗi video tốn một lượt gọi dịch LLM và có thể một credit Supadata).
export const MAX_VIDEOS_PER_USER_PER_DAY = 3;
/** Trần chung mọi người trong 24 giờ: chặn việc tạo hàng loạt tài khoản ẩn danh để lách giới hạn từng người. */
export const MAX_USER_VIDEOS_PER_DAY_TOTAL = 100;
/** Video quá dài làm dịch vượt thời gian của route và tốn kém; podcast dài hơn một giờ chưa hỗ trợ. */
export const MAX_ADDED_VIDEO_SECONDS = 60 * 60;
/** Video quá ngắn (Shorts, đoạn chào) không đủ câu để luyện. */
export const MIN_ADDED_VIDEO_SECONDS = 30;

export type AddLimitDecision = "ok" | "user_limit" | "global_limit";

/** Quyết định từ số video đã thêm trong 24 giờ qua: của người này và của tất cả. */
export function decideAddLimit(userCount: number, totalCount: number): AddLimitDecision {
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
