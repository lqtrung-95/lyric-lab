import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { restoreLineTranslation } from "./restore-line-translation";
import type { LessonLine } from "./video-lesson-types";

export interface AdminTranslationReport {
  id: number;
  lineIdx: number;
  oldTranslation: string | null;
  outcome: "retranslated" | "reported";
  createdAt: string;
}

interface ReportRow {
  id: number; line_idx: number; old_translation: string | null; outcome: "retranslated" | "reported"; created_at: string;
}

const toReport = (r: ReportRow): AdminTranslationReport => ({ id: r.id, lineIdx: r.line_idx, oldTranslation: r.old_translation, outcome: r.outcome, createdAt: r.created_at });

/** Các báo cáo bản dịch của một video (mới nhất trước). Trả mảng rỗng nếu bảng chưa có (migration chưa chạy), để trang admin vẫn dùng được. */
export async function listTranslationReports(videoId: string): Promise<AdminTranslationReport[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_translation_reports")
    .select("id, line_idx, old_translation, outcome, created_at").eq("video_id", videoId).order("created_at", { ascending: false }).limit(500);
  if (error) return [];
  return ((data ?? []) as unknown as ReportRow[]).map(toReport);
}

/**
 * Khôi phục bản dịch cũ ghi trong một báo cáo "AI đã dịch lại". "ok" khi đã khôi phục; "not_found" khi không có báo cáo (hoặc không thuộc video/không phải
 * báo cáo dịch lại); "unchanged" khi dòng không còn là bản AI (đã được admin sửa hoặc khôi phục rồi), không ghi đè.
 */
export async function restoreTranslationFromReport(videoId: string, reportId: number): Promise<"ok" | "not_found" | "unchanged"> {
  const sb = createSupabaseServiceClient();
  const { data: report, error } = await sb.from("video_translation_reports")
    .select("line_idx, old_translation").eq("id", reportId).eq("video_id", videoId).eq("outcome", "retranslated").maybeSingle();
  if (error) throw new Error(`restoreTranslationFromReport: ${error.message}`);
  if (!report) return "not_found";
  const { data: lesson, error: lessonError } = await sb.from("video_lessons").select("lines").eq("video_id", videoId).maybeSingle();
  if (lessonError) throw new Error(`restoreTranslationFromReport: ${lessonError.message}`);
  if (!lesson) return "not_found";
  const restored = restoreLineTranslation((lesson as unknown as { lines: LessonLine[] }).lines, (report as { line_idx: number }).line_idx, (report as { old_translation: string | null }).old_translation);
  if (!restored) return "unchanged";
  const { error: updateError } = await sb.from("video_lessons").update({ lines: restored, updated_at: new Date().toISOString() }).eq("video_id", videoId);
  if (updateError) throw new Error(`restoreTranslationFromReport: ${updateError.message}`);
  return "ok";
}
