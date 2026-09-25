// Mã lỗi gửi cho client qua SSE; UI (màn S3) chọn thông báo và hành động theo mã.
export type AnalysisErrorCode =
  | "invalid_video"
  | "video_not_found"
  | "no_lyrics"
  | "rate_limited"
  | "analysis_failed"
  | "server_error";

/** Đổi lỗi từ pipeline sang mã lỗi cho client. So theo tên lớp vì lỗi có thể đi qua ranh giới module. */
export function toAnalysisErrorCode(error: unknown): AnalysisErrorCode {
  const name = error instanceof Error ? error.name : "";
  if (name === "NoLyricsError") return "no_lyrics";
  if (name === "AnalysisFailedError") return "analysis_failed";
  return "server_error";
}
