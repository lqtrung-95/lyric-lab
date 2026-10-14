import "server-only";
import { createChat } from "@/lib/analysis/server-deps";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import type { CurrentUser } from "@/lib/auth/current-user";
import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { MIN_ADDED_VIDEO_SECONDS } from "@/lib/video/add-video-limits";
import { fetchVideosMeta } from "@/lib/video/youtube-data-api";
import { MAX_ASR_VIDEO_SECONDS, planAsrChunks } from "./asr-chunks";
import { transcribeChunkWithGemini } from "./transcribe-chunk-gemini";

/** Trần chung mọi người trong 24 giờ (số đoạn 2 phút): chặn việc tạo hàng loạt tài khoản ẩn danh để lách hạn mức từng người. ~55 video 22 phút. */
export const GLOBAL_ASR_CHUNKS_PER_DAY = 600;

export type ChunkOutcome =
  | { kind: "ok"; lines: CaptionLine[]; chunkCount: number }
  | { kind: "account_required" | "not_found" | "exists" | "not_embeddable" | "too_short" | "too_long" | "invalid_chunk" | "user_limit" | "global_limit" }
  | { kind: "ai_unavailable" };

/**
 * Nhận dạng giọng nói MỘT đoạn của video chưa có trong kho, cho người học tự thêm video không có phụ đề. Chỉ tài khoản đã đăng nhập Google (tài khoản ẩn danh tạo hàng loạt được nên
 * không dùng được tính năng tốn tiền AI này). Thứ tự: kiểm tra tài khoản → kiểm tra video (có, nhúng được, độ dài) →
 * hạn mức riêng và chung → trừ một lượt `transcribe` → Gemini nghe đoạn → lỗi AI thì hoàn lượt. Admin không bị hai hạn mức.
 */
export async function transcribeChunkForUser(user: CurrentUser, videoId: string, chunkIndex: number): Promise<ChunkOutcome> {
  if (user.isAnonymous) return { kind: "account_required" };
  const env = getServerEnv();
  const sb = createSupabaseServiceClient();
  const { data: existing, error: existsError } = await sb.from("video_lessons").select("video_id").eq("video_id", videoId).maybeSingle();
  if (existsError) throw new Error(`đọc video_lessons: ${existsError.message}`);
  if (existing) return { kind: "exists" };

  const meta = (await fetchVideosMeta([videoId], env.YOUTUBE_DATA_API_KEY)).get(videoId);
  if (!meta) return { kind: "not_found" };
  if (!meta.embeddable) return { kind: "not_embeddable" };
  if (meta.durationSec < MIN_ADDED_VIDEO_SECONDS) return { kind: "too_short" };
  if (meta.durationSec > MAX_ASR_VIDEO_SECONDS) return { kind: "too_long" };
  const chunks = planAsrChunks(meta.durationSec);
  const chunk = chunks[chunkIndex];
  if (!chunk) return { kind: "invalid_chunk" };

  const admin = isAdminAccount(user.email ?? null);
  if (!admin) {
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { count, error } = await sb.from("usage_events").select("id", { count: "exact", head: true }).eq("kind", "transcribe").gte("created_at", since);
    if (error) throw new Error(`đếm lượt nhận dạng: ${error.message}`);
    if ((count ?? 0) >= GLOBAL_ASR_CHUNKS_PER_DAY) return { kind: "global_limit" };
  }
  if (!(await consumeUsage(user, "transcribe"))) return { kind: "user_limit" };
  try {
    const lines = await transcribeChunkWithGemini(createChat(env), videoId, chunk, meta.durationSec);
    return { kind: "ok", lines, chunkCount: chunks.length };
  } catch (error) {
    await refundUsage(user, "transcribe");
    console.error(JSON.stringify({ event: "video_transcribe_error", videoId, chunk: chunkIndex, message: (error as Error)?.message }));
    return { kind: "ai_unavailable" };
  }
}
