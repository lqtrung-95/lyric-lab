import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { withLineTranslation } from "./edit-lesson-line";
import type { LessonLine, LessonStatus, TranscriptSource, TranslationSource } from "./video-lesson-types";
import { MAX_TAGS_PER_VIDEO, normalizeTags, type VideoTagId } from "./video-tags";

export interface LessonSummary {
  videoId: string;
  title: string;
  channelTitle: string;
  durationSec: number;
  levelAvg: number | null;
  lineCount: number;
  /** Thẻ chủ đề (chỉ có ở danh sách công khai; thiếu khi cột `tags` chưa có trên DB). */
  tags?: VideoTagId[];
}

export interface LessonDetail extends LessonSummary {
  translationSource: TranslationSource;
  transcriptSource: TranscriptSource;
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

/**
 * Các video đã duyệt (`listed`), mới nhất trước, kèm thẻ chủ đề. Cột `tags` do migration thêm sau: chưa có thì đọc lại không kèm thẻ để danh sách video vẫn hiện
 * (deploy trước migration không làm hỏng trang Video).
 */
export async function listListedLessons(): Promise<LessonSummary[]> {
  const sb = createSupabaseServiceClient();
  const query = (columns: string) => sb.from("video_lessons").select(columns).eq("status", "listed").order("created_at", { ascending: false });
  let { data, error } = await query(`${SUMMARY_COLUMNS}, tags`);
  if (error && /tags/i.test(error.message)) ({ data, error } = await query(SUMMARY_COLUMNS));
  if (error) throw new Error(`listListedLessons: ${error.message}`);
  return ((data ?? []) as unknown as (SummaryRow & { tags?: unknown })[]).map((r) => ({ ...toSummary(r), ...("tags" in r ? { tags: normalizeTags(r.tags) } : {}) }));
}

/** Thẻ hiện có của một video (admin); mảng rỗng nếu cột `tags` chưa có hoặc video chưa có thẻ. */
export async function getLessonTags(videoId: string): Promise<VideoTagId[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("tags").eq("video_id", videoId).maybeSingle();
  return error || !data ? [] : normalizeTags((data as { tags?: unknown }).tags);
}

/** Đặt thẻ của video (đã chuẩn hóa, tối đa `MAX_TAGS_PER_VIDEO`); false nếu không có video. Ném lỗi nếu cột `tags` chưa có (migration chưa chạy). */
export async function setLessonTags(videoId: string, tags: unknown): Promise<boolean> {
  const clean = normalizeTags(tags).slice(0, MAX_TAGS_PER_VIDEO);
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").update({ tags: clean, updated_at: new Date().toISOString() }).eq("video_id", videoId).select("video_id");
  if (error) throw new Error(`setLessonTags: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Một video đã duyệt kèm toàn bộ dòng; null nếu không có hoặc chưa/không còn được hiện. */
export async function getListedLesson(videoId: string): Promise<LessonDetail | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons")
    .select(`${SUMMARY_COLUMNS}, translation_source, transcript_source, lines`).eq("video_id", videoId).eq("status", "listed").maybeSingle();
  if (error) throw new Error(`getListedLesson: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as SummaryRow & { translation_source: TranslationSource; transcript_source: TranscriptSource; lines: LessonLine[] };
  return { ...toSummary(row), translationSource: row.translation_source, transcriptSource: row.transcript_source, lines: row.lines };
}

/** Dòng của video để giải nghĩa từ (ngoài video đã ẩn): null nếu không có video hoặc video bị ẩn. */
export async function getLessonLinesForExplain(videoId: string): Promise<LessonLine[] | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("lines").eq("video_id", videoId).neq("status", "hidden").maybeSingle();
  if (error) throw new Error(`getLessonLinesForExplain: ${error.message}`);
  return data ? ((data as unknown as { lines: LessonLine[] }).lines) : null;
}

/** Tiêu đề, kênh và các dòng của video (trừ video đã ẩn) để dựng câu cho thẻ ôn và nghe lại đoạn của từ đã lưu: null nếu không có hoặc bị ẩn. */
export async function getLessonForReview(videoId: string): Promise<{ title: string; channelTitle: string; lines: LessonLine[] } | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("title, channel_title, lines").eq("video_id", videoId).neq("status", "hidden").maybeSingle();
  if (error) throw new Error(`getLessonForReview: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as { title: string; channel_title: string; lines: LessonLine[] };
  return { title: row.title, channelTitle: row.channel_title, lines: row.lines };
}

/** Video còn hiện được (chưa bị ẩn) có bài học trong kho video không. */
export async function hasVisibleLesson(videoId: string): Promise<boolean> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select("video_id").eq("video_id", videoId).neq("status", "hidden").maybeSingle();
  if (error) throw new Error(`hasVisibleLesson: ${error.message}`);
  return !!data;
}

// ---- Quản trị (chỉ gọi từ route đã kiểm tra quyền admin) ----

export interface AdminLessonSummary extends LessonSummary {
  status: LessonStatus;
  translationSource: TranslationSource;
  translatedLineCount: number;
  createdAt: string;
}

export interface AdminLessonDetail extends AdminLessonSummary {
  lines: LessonLine[];
}

const ADMIN_COLUMNS = `${SUMMARY_COLUMNS}, status, translation_source, translated_line_count, created_at`;
type AdminRow = SummaryRow & { status: LessonStatus; translation_source: TranslationSource; translated_line_count: number; created_at: string };
const toAdminSummary = (r: AdminRow): AdminLessonSummary => ({
  ...toSummary(r), status: r.status, translationSource: r.translation_source, translatedLineCount: r.translated_line_count, createdAt: r.created_at,
});

/** Mọi video, mọi trạng thái (mới nhất trước), không kèm dòng. */
export async function listAllLessons(): Promise<AdminLessonSummary[]> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select(ADMIN_COLUMNS).order("created_at", { ascending: false });
  if (error) throw new Error(`listAllLessons: ${error.message}`);
  return ((data ?? []) as unknown as AdminRow[]).map(toAdminSummary);
}

export async function getLessonForAdmin(videoId: string): Promise<AdminLessonDetail | null> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons").select(`${ADMIN_COLUMNS}, lines`).eq("video_id", videoId).maybeSingle();
  if (error) throw new Error(`getLessonForAdmin: ${error.message}`);
  if (!data) return null;
  const row = data as unknown as AdminRow & { lines: LessonLine[] };
  return { ...toAdminSummary(row), lines: row.lines };
}

/** Đổi trạng thái; false nếu không có video. */
export async function setLessonStatus(videoId: string, status: LessonStatus): Promise<boolean> {
  const { data, error } = await createSupabaseServiceClient().from("video_lessons")
    .update({ status, updated_at: new Date().toISOString() }).eq("video_id", videoId).select("video_id");
  if (error) throw new Error(`setLessonStatus: ${error.message}`);
  return (data?.length ?? 0) > 0;
}

/** Xóa hẳn video (cache nghĩa từ của video xóa theo nhờ khóa ngoại cascade). */
export async function deleteLesson(videoId: string): Promise<void> {
  const { error } = await createSupabaseServiceClient().from("video_lessons").delete().eq("video_id", videoId);
  if (error) throw new Error(`deleteLesson: ${error.message}`);
}

/** Sửa bản dịch một dòng. "not_found" nếu không có video hoặc dòng, "invalid" nếu bản dịch quá dài. */
export async function editLessonTranslation(videoId: string, idx: number, translation: string): Promise<"ok" | "not_found" | "invalid"> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("video_lessons").select("lines").eq("video_id", videoId).maybeSingle();
  if (error) throw new Error(`editLessonTranslation: ${error.message}`);
  if (!data) return "not_found";
  const lines = (data as unknown as { lines: LessonLine[] }).lines;
  if (!lines.some((l) => l.idx === idx)) return "not_found";
  const edit = withLineTranslation(lines, idx, translation);
  if (!edit) return "invalid";
  const { error: updateError } = await sb.from("video_lessons")
    .update({ lines: edit.lines, translated_line_count: edit.translatedLineCount, updated_at: new Date().toISOString() }).eq("video_id", videoId);
  if (updateError) throw new Error(`editLessonTranslation: ${updateError.message}`);
  return "ok";
}
