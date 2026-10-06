import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { LessonLine, TranslationSource } from "./video-lesson-types";

export interface LessonSummary {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSec: number;
  levelAvg: number | null;
  lineCount: number;
}

export interface LessonDetail extends LessonSummary {
  translationSource: TranslationSource;
  lines: LessonLine[];
}

const SUMMARY_COLUMNS = "video_id, title, channel_title, duration_sec, level_avg, line_count";

interface SummaryRow {
  video_id: string; title: string; channel_title: string; duration_sec: number; level_avg: number | null; line_count: number;
}

const toSummary = (r: SummaryRow): LessonSummary => ({
  videoId: r.video_id, title: r.title, channelTitle: r.channel_title, durationSec: r.duration_sec,
  levelAvg: r.level_avg === null ? null : Number(r.level_avg), lineCount: r.line_count,
});

/** Các video đã duyệt (`listed`), mới nhất trước. */
export async function listListedLessons(): Promise<LessonSummary[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select(SUMMARY_COLUMNS).eq("status", "listed").order("created_at", { ascending: false });
  if (error) throw new Error(`listListedLessons: ${error.message}`);
  return ((data ?? []) as unknown as SummaryRow[]).map(toSummary);
}

/** Một video đã duyệt kèm toàn bộ dòng; null nếu không có hoặc chưa/không còn được hiện. */
export async function getListedLesson(videoId: string): Promise<LessonDetail | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons")
    .select(`${SUMMARY_COLUMNS}, translation_source, lines`).eq("video_id", videoId).eq("status", "listed").maybeSingle();
  if (error) throw new Error(`getListedLesson: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as SummaryRow & { translation_source: TranslationSource; lines: LessonLine[] };
  return { ...toSummary(row), translationSource: row.translation_source, lines: row.lines };
}

/** Dòng của video để giải nghĩa từ (ngoài video đã ẩn): null nếu không có video hoặc video bị ẩn. */
export async function getLessonLinesForExplain(videoId: string): Promise<LessonLine[] | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("lines").eq("video_id", videoId).neq("status", "hidden").maybeSingle();
  if (error) throw new Error(`getLessonLinesForExplain: ${error.message}`);
  return data ? ((data as unknown as { lines: LessonLine[] }).lines) : null;
}
