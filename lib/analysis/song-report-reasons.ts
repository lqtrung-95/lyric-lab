// Lý do báo cả bài sai. Tách khỏi schema (zod) để giao diện không kéo zod xuống trình duyệt.
export const SONG_REPORT_REASONS = ["lyrics_mismatch", "wrong_language", "not_a_song"] as const;
export type SongReportReason = (typeof SONG_REPORT_REASONS)[number];

export const SONG_REPORT_LABELS: Record<SongReportReason, string> = {
  lyrics_mismatch: "Lời không khớp với video",
  wrong_language: "Không phải lời tiếng Trung",
  not_a_song: "Không phải bài hát",
};

/** Số người khác nhau báo sai thì bài bị ẩn khỏi tab Khám phá. */
export const SONG_REPORT_HIDE_THRESHOLD = 3;
