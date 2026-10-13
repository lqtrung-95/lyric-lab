import "server-only";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { applyTranslations } from "./apply-translations";
import { translateLines, type TranslateOptions } from "./translate-lines";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { LessonLine, TranslationSource } from "./video-lesson-types";

/**
 * Admin dịch bù bằng AI các dòng còn trống của một video (video thêm lúc ngân sách AI trong ngày đã hết, hoặc dòng bị lỗi dịch). Không bị ngân sách
 * ngày chặn vì do admin chủ động bấm. `options.chatWrap` cho script chạy hàng loạt giãn nhịp gọi AI (tránh vượt số request mỗi phút). Trả số dòng vừa dịch và số dòng còn trống (quá thời gian thì phần còn lại để lần bấm sau); "not_found" nếu không có video.
 */
export interface TranslateMissingResult {
  translated: number;
  remaining: number;
  /** Các dòng vừa được điền bản dịch lượt này (để giao diện cập nhật ngay không cần tải lại). */
  filled: { idx: number; translation: string }[];
}

export async function translateMissingLessonLines(videoId: string, options: TranslateOptions & { chatWrap?: (chat: ChatFn) => ChatFn } = {}): Promise<TranslateMissingResult | "not_found"> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("video_lessons").select("lines, translation_source, title").eq("video_id", videoId).maybeSingle();
  if (error) throw new Error(`translateMissingLessonLines: ${error.message}`);
  if (!data) return "not_found";
  const { lines, translation_source: source, title } = data as unknown as { lines: LessonLine[]; translation_source: TranslationSource; title: string };
  if (!lines.some((l) => !l.translation)) return { translated: 0, remaining: 0, filled: [] };

  const { chatWrap, ...translateOptions } = options;
  const chat = createChat(getServerEnv());
  const filled = await translateLines(lines, chatWrap ? chatWrap(chat) : chat, undefined, { title, ...translateOptions });
  const applied = applyTranslations(lines, filled);
  if (applied.newlyTranslated > 0) {
    const { error: updateError } = await sb.from("video_lessons").update({
      lines: applied.lines, translated_line_count: applied.translatedLineCount,
      translation_source: source === "none" ? "ai" : source, updated_at: new Date().toISOString(),
    }).eq("video_id", videoId);
    if (updateError) throw new Error(`translateMissingLessonLines: ${updateError.message}`);
  }
  const filledLines = applied.lines.flatMap((l, i) => (!lines[i].translation && l.translation ? [{ idx: l.idx, translation: l.translation }] : []));
  return { translated: applied.newlyTranslated, remaining: lines.length - applied.translatedLineCount, filled: filledLines };
}
