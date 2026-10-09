import { HIDING_REASONS, VIDEO_REPORT_HIDE_THRESHOLD, type VideoReportReason } from "./video-report-reasons";
import type { LessonStatus } from "./video-lesson-types";

export interface OpenReport {
  userId: string | null;
  reason: VideoReportReason;
}

export interface AutoHideInput {
  /** Các báo cáo chưa được admin bỏ qua của video. */
  openReports: OpenReport[];
  status: LessonStatus;
  /** Video do người dùng thêm (video admin tuyển chọn không tự ẩn). */
  addedByUser: boolean;
}

/**
 * Có nên tự ẩn video chờ admin xem không. Chỉ video do người dùng thêm đang hiện; đếm số người khác nhau báo lý do "cả video có vấn đề"
 * (báo bản dịch sai không tính). Báo cáo không có người báo (tài khoản đã xóa) không tính vì không phân biệt được người.
 */
export function shouldAutoHide({ openReports, status, addedByUser }: AutoHideInput): boolean {
  if (!addedByUser || status !== "listed") return false;
  const reporters = new Set(openReports.filter((r) => r.userId && HIDING_REASONS.includes(r.reason)).map((r) => r.userId));
  return reporters.size >= VIDEO_REPORT_HIDE_THRESHOLD;
}
