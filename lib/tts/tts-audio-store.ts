import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { ttsStoragePath } from "./tts-text";

export const TTS_BUCKET = "tts";

/** Đọc file giọng đã lưu; null nếu chưa có. */
export async function readStoredAudio(sb: SupabaseClient, text: string): Promise<Buffer | null> {
  const { data, error } = await sb.storage.from(TTS_BUCKET).download(ttsStoragePath(text));
  if (error || !data) return null;
  return Buffer.from(await data.arrayBuffer());
}

/** Lưu file giọng để mọi người dùng lại (không gọi Azure lần nữa). Lỗi lưu chỉ ghi log: vẫn trả được âm thanh cho lần này. */
export async function storeAudio(sb: SupabaseClient, text: string, audio: Buffer): Promise<void> {
  const { error } = await sb.storage.from(TTS_BUCKET).upload(ttsStoragePath(text), audio, { contentType: "audio/mpeg", upsert: true });
  if (error) console.error(JSON.stringify({ event: "tts_store_error", message: error.message }));
}
