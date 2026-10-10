import "server-only";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { applyRetranslation, canRetranslate } from "./apply-retranslation";
import { VIDEO_TRANSLATION_QUALITY_MODELS, translateLines } from "./translate-lines";
import type { LessonLine } from "./video-lesson-types";

/**
 * Admin dịch lại TOÀN BỘ bản dịch của một video bằng AI, dùng khi bản dịch lấy từ phụ đề YouTube ghép lệch câu, hoặc (`includeAi`) khi muốn làm lại bản AI cũ bằng model tốt hơn. Luôn giữ dòng admin đã sửa; mặc định giữ cả dòng AI đã dịch lại;
 * dòng AI chưa dịch được (lỗi hoặc quá 25 giây kể từ lúc bắt đầu) giữ bản cũ, bấm lại để dịch tiếp. Khi không còn dòng nào chờ thì đánh dấu nguồn bản dịch là AI.
 * Không bị ngân sách ngày chặn vì do admin chủ động bấm. "not_found" nếu không có video.
 */
export async function retranslateLessonLines(videoId: string, includeAi = false): Promise<{ replaced: number; remaining: number } | "not_found"> {
  const sb = createSupabaseServiceClient();
  const { data, error } = await sb.from("video_lessons").select("lines, title").eq("video_id", videoId).maybeSingle();
  if (error) throw new Error(`retranslateLessonLines: ${error.message}`);
  if (!data) return "not_found";
  const { lines, title } = data as unknown as { lines: LessonLine[]; title: string };

  // Xóa bản dịch cũ của các dòng đủ điều kiện để bộ dịch coi là "còn thiếu"; dòng đã chốt giữ nguyên nên bộ dịch bỏ qua.
  const blank = lines.map((l) => (canRetranslate(l, includeAi) ? { ...l, translation: null } : l));
  const fresh = await translateLines(blank, createChat(getServerEnv()), VIDEO_TRANSLATION_QUALITY_MODELS, { title, concurrency: 6 });
  const applied = applyRetranslation(lines, fresh, includeAi);
  if (applied.replaced > 0) {
    const { error: updateError } = await sb.from("video_lessons").update({
      lines: applied.lines, translated_line_count: applied.translatedLineCount,
      ...(applied.remaining === 0 ? { translation_source: "ai" } : {}), updated_at: new Date().toISOString(),
    }).eq("video_id", videoId);
    if (updateError) throw new Error(`retranslateLessonLines: ${updateError.message}`);
  }
  return { replaced: applied.replaced, remaining: applied.remaining };
}
