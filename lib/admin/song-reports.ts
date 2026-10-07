import "server-only";
import { SONG_REPORT_REASONS, type SongReportReason } from "@/lib/analysis/song-report-reasons";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ReportedSong } from "./song-report-types";

interface Row { video_id: string; reason: string; created_at: string; songs: { title: string; listed: boolean } | null }

const isReason = (r: string): r is SongReportReason => (SONG_REPORT_REASONS as readonly string[]).includes(r);

/** Gộp các lượt báo theo bài (pure để test): nhiều người báo cùng một bài thành một dòng, bài báo gần nhất lên đầu. */
export function groupSongReports(rows: Row[]): ReportedSong[] {
  const byVideo = new Map<string, ReportedSong>();
  for (const r of rows) {
    const found = byVideo.get(r.video_id) ?? { videoId: r.video_id, title: r.songs?.title ?? r.video_id, hidden: r.songs ? !r.songs.listed : false, total: 0, byReason: {}, latestAt: r.created_at };
    found.total++;
    if (isReason(r.reason)) found.byReason[r.reason] = (found.byReason[r.reason] ?? 0) + 1;
    if (r.created_at > found.latestAt) found.latestAt = r.created_at;
    byVideo.set(r.video_id, found);
  }
  return [...byVideo.values()].sort((a, b) => (a.latestAt < b.latestAt ? 1 : -1));
}

/** Các bài đang bị báo sai (mới nhất trước); truyền `videoId` để chỉ lấy một bài. */
export async function listReportedSongs(videoId?: string): Promise<ReportedSong[]> {
  let query = createSupabaseServiceClient().from("song_reports").select("video_id,reason,created_at,songs(title,listed)").order("created_at", { ascending: false }).limit(1000);
  if (videoId) query = query.eq("video_id", videoId);
  const { data, error } = await query;
  if (error) throw new Error(`song_reports: ${error.message}`);
  return groupSongReports((data ?? []) as unknown as Row[]);
}

/** Xóa mọi báo cáo của một bài (đã xử lý). Trả số báo cáo đã xóa. */
export async function dismissSongReports(videoId: string): Promise<number> {
  const { data, error } = await createSupabaseServiceClient().from("song_reports").delete().eq("video_id", videoId).select("id");
  if (error) throw new Error(`song_reports: ${error.message}`);
  return data?.length ?? 0;
}
