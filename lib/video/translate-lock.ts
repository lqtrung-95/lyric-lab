import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

/** Dài hơn `maxDuration` (60 giây) của route dịch, để khóa tự hết hạn nếu tiến trình chết giữa chừng mà không kịp nhả. */
const LOCK_SECONDS = 70;

export type LockResult = "acquired" | "busy" | "not_found";

/**
 * Giành khóa dịch của một video (nguyên tử trong Postgres: chỉ một yêu cầu thắng). "busy" khi người khác đang dịch video này,
 * "not_found" khi video không có hoặc đã bị ẩn.
 */
export async function acquireTranslateLock(videoId: string): Promise<LockResult> {
  const sb = createSupabaseServiceClient();
  const now = new Date();
  const until = new Date(now.getTime() + LOCK_SECONDS * 1000).toISOString();
  const { data, error } = await sb.from("video_lessons").update({ translate_lock_until: until })
    .eq("video_id", videoId).neq("status", "hidden").or(`translate_lock_until.is.null,translate_lock_until.lt.${now.toISOString()}`).select("video_id");
  if (error) throw new Error(`acquireTranslateLock: ${error.message}`);
  if ((data ?? []).length > 0) return "acquired";
  const { data: row, error: readError } = await sb.from("video_lessons").select("status").eq("video_id", videoId).maybeSingle();
  if (readError) throw new Error(`acquireTranslateLock: ${readError.message}`);
  return row && (row as { status: string }).status !== "hidden" ? "busy" : "not_found";
}

/** Nhả khóa; lỗi chỉ ghi log (khóa tự hết hạn sau `LOCK_SECONDS`), không làm hỏng việc trả kết quả. */
export async function releaseTranslateLock(videoId: string): Promise<void> {
  const { error } = await createSupabaseServiceClient().from("video_lessons").update({ translate_lock_until: null }).eq("video_id", videoId);
  if (error) console.error(JSON.stringify({ event: "release_translate_lock_error", videoId, message: error.message }));
}
