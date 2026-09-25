// Lý do báo sai thẻ. Tách khỏi report-schema (dùng zod, ~95 KB gzip) để phần giao diện không kéo zod xuống trình duyệt.
export const REPORT_REASONS = ["wrong_meaning", "wrong_pinyin", "not_worth_learning"] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  wrong_meaning: "Sai nghĩa",
  wrong_pinyin: "Sai pinyin",
  not_worth_learning: "Không đáng học",
};
