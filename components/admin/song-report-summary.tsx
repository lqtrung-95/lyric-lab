import { SONG_REPORT_LABELS, type SongReportReason } from "@/lib/analysis/song-report-reasons";
import type { ReportedSong } from "@/lib/admin/song-report-types";

/** Các lý do báo kèm số người, ví dụ "Lời không khớp với video ×2 · Không phải bài hát ×1". */
export function reasonSummary(byReason: ReportedSong["byReason"]): string {
  return (Object.entries(byReason) as [SongReportReason, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([reason, n]) => `${SONG_REPORT_LABELS[reason]} ×${n}`)
    .join(" · ");
}
