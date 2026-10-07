import type { SongReportReason } from "@/lib/analysis/song-report-reasons";

/** Một bài đang bị người dùng báo sai, gộp theo bài. */
export interface ReportedSong {
  videoId: string;
  title: string;
  /** Bài đang bị ẩn khỏi tab Khám phá (đủ người báo hoặc admin ẩn). */
  hidden: boolean;
  total: number;
  byReason: Partial<Record<SongReportReason, number>>;
  /** Thời điểm báo gần nhất (ISO). */
  latestAt: string;
}
