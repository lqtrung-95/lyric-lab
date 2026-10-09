// Lý do người học báo một video sai. Tách khỏi schema (zod) để giao diện không kéo zod xuống trình duyệt.
export const VIDEO_REPORT_REASONS = ["wrong_subtitles", "wrong_translation", "not_chinese", "inappropriate"] as const;
export type VideoReportReason = (typeof VIDEO_REPORT_REASONS)[number];

export const VIDEO_REPORT_LABELS: Record<VideoReportReason, string> = {
  wrong_subtitles: "Phụ đề tiếng Trung sai hoặc lệch",
  wrong_translation: "Bản dịch sai nhiều",
  not_chinese: "Không phải tiếng Trung",
  inappropriate: "Nội dung không phù hợp",
};

/** Lý do nói rằng cả video có vấn đề (đáng ẩn). "Bản dịch sai" thì sửa/dịch lại được nên không tính để tự ẩn. */
export const HIDING_REASONS: readonly VideoReportReason[] = ["wrong_subtitles", "not_chinese", "inappropriate"];

/** Số người KHÁC NHAU báo video có vấn đề (theo HIDING_REASONS, chưa được admin bỏ qua) thì video do người dùng thêm tự ẩn chờ admin xem. */
export const VIDEO_REPORT_HIDE_THRESHOLD = 3;
/** Một người báo tối đa chừng này video mỗi 24 giờ (chặn việc báo hàng loạt để ẩn video của người khác). */
export const MAX_VIDEO_REPORTS_PER_USER_PER_DAY = 20;
