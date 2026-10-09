import "server-only";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { applyTranslations } from "./apply-translations";
import { translateLines } from "./translate-lines";
import type { LessonLine, TranslationSource } from "./video-lesson-types";

/**
 * Admin dịch bù bằng AI các dòng còn trống của một video (video thêm lúc ngân sách AI trong ngày đã hết, hoặc dòng bị lỗi dịch). Không bị ngân sách
 * ngày chặn vì do admin chủ động bấm. Trả số dòng vừa dịch và số dòng còn trống (quá thời gian thì phần còn lại để lần bấm sau); "not_found" nếu không có video.
 */
export async function translateMissingLessonLines(videoId: string): Promise<{ translated: number; remaining: number } | "not_found"> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("video_lessons").select("lines, translation_source").eq("video_id", videoId).maybeSingle();
  if (error) throw new Error(`translateMissingLessonLines: ${error.message}`);
  if (!data) return "not_found";
  const { lines, translation_source: source } = data as unknown as { lines: LessonLine[]; translation_source: TranslationSource };
  if (!lines.some((l) => !l.translation)) return { translated: 0, remaining: 0 };

  const filled = await translateLines(lines, createChat(getServerEnv()));
  const applied = applyTranslations(lines, filled);
  if (applied.newlyTranslated > 0) {
    const { error: updateError } = await sb.from("video_lessons").update({
      lines: applied.lines, translated_line_count: applied.translatedLineCount,
      translation_source: source === "none" ? "ai" : source, updated_at: new Date().toISOString(),
    }).eq("video_id", videoId);
    if (updateError) throw new Error(`translateMissingLessonLines: ${updateError.message}`);
  }
  return { translated: applied.newlyTranslated, remaining: lines.length - applied.translatedLineCount };
}
