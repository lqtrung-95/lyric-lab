import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { OpenReport } from "./video-report-policy";
import type { VideoReportReason } from "./video-report-reasons";

export interface AdminVideoReport {
  id: number;
  reason: VideoReportReason;
  createdAt: string;
  resolved: boolean;
}

interface Row {
  id: number; user_id: string | null; reason: VideoReportReason; created_at: string; resolved_at: string | null;
}

/** Báo cáo chưa xử lý của một video, để quyết định tự ẩn. Ném lỗi nếu không đọc được (không được coi như chưa ai báo). */
export async function listOpenReports(videoId: string): Promise<OpenReport[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_reports").select("user_id, reason").eq("video_id", videoId).is("resolved_at", null);
  if (error) throw new Error(`listOpenReports: ${error.message}`);
  return ((data ?? []) as unknown as { user_id: string | null; reason: VideoReportReason }[]).map((r) => ({ userId: r.user_id, reason: r.reason }));
}

/** Số báo cáo chưa xử lý của từng video (video không có thì không có trong bản đồ). Bảng chưa có (migration chưa chạy) thì trả bản đồ rỗng để trang admin vẫn dùng được. */
export async function countOpenReportsByVideo(): Promise<Map<string, number>> {
  const { data, error } = await createSupabaseServiceClient().from("video_reports").select("video_id").is("resolved_at", null).limit(5000);
  const counts = new Map<string, number>();
  if (error) return counts;
  for (const r of (data ?? []) as unknown as { video_id: string }[]) counts.set(r.video_id, (counts.get(r.video_id) ?? 0) + 1);
  return counts;
}

/** Các báo cáo của một video (mới nhất trước) cho trang chi tiết admin. Mảng rỗng nếu bảng chưa có. */
export async function listVideoReports(videoId: string): Promise<AdminVideoReport[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_reports")
    .select("id, user_id, reason, created_at, resolved_at").eq("video_id", videoId).order("created_at", { ascending: false }).limit(200);
  if (error) return [];
  return ((data ?? []) as unknown as Row[]).map((r) => ({ id: r.id, reason: r.reason, createdAt: r.created_at, resolved: r.resolved_at !== null }));
}

/** Admin bỏ qua mọi báo cáo đang mở của video; trả số báo cáo vừa đóng. */
export async function dismissOpenReports(videoId: string): Promise<number> {
  const { data, error } = await createSupabaseServiceClient().from("video_reports")
    .update({ resolved_at: new Date().toISOString() }).eq("video_id", videoId).is("resolved_at", null).select("id");
  if (error) throw new Error(`dismissOpenReports: ${error.message}`);
  return data?.length ?? 0;
}
