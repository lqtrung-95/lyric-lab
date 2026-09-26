import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServerEnv } from "@/lib/env/server-env";
import { synthesizeWithAzure } from "./azure-speech";
import { TTS_BUCKET, storeAudio } from "./tts-audio-store";
import { normalizeTtsText, ttsStoragePath } from "./tts-text";

/**
 * Tổng hợp trước giọng đọc cho các từ vựng của một bài vừa phân tích, để người dùng bấm loa là nghe ngay không phải chờ.
 * Chạy một lần cho mỗi bài (không theo lượt người dùng nên không tính hạn mức từng người), tuần tự để nhẹ với Azure.
 * Mọi lỗi (thiếu khóa, hết hạn mức tháng, mạng) chỉ bỏ qua: nút loa vẫn tự tổng hợp khi cần hoặc rơi về giọng hệ thống.
 */
export async function prewarmTts(sb: SupabaseClient, terms: string[]): Promise<number> {
  const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region } = getServerEnv();
  if (!key || !region) return 0;
  const texts = [...new Set(terms.map(normalizeTtsText).filter((t): t is string => t !== null))];
  let created = 0;
  for (const text of texts) {
    try {
      const { data: exists } = await sb.storage.from(TTS_BUCKET).exists(ttsStoragePath(text));
      if (exists) continue;
      await storeAudio(sb, text, await synthesizeWithAzure(text, key, region));
      created++;
    } catch {
      break; // Azure lỗi/hết hạn mức: dừng cả lượt, không thử tiếp từng từ.
    }
  }
  return created;
}
