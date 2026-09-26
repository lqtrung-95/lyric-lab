import { track as vercelTrack } from "@vercel/analytics";

/** Sự kiện ẩn danh (không kèm định danh hay nội dung bài hát) để đo phễu và tỷ lệ quay lại. Lỗi được bỏ qua. */
export type AnalyticsEvent =
  | "analysis_started"
  | "card_saved"
  | "review_session_done"
  | "practice_round_done"
  | "share_card"
  | "leaderboard_joined";

export function track(event: AnalyticsEvent, props?: Record<string, string | number>): void {
  try {
    vercelTrack(event, props);
  } catch {
    // đo lường không được làm hỏng luồng học
  }
}
