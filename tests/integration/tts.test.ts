import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { describe, expect, it, vi } from "vitest";

// Giọng đọc thật: gọi Azure Speech (vài ký tự trong gói miễn phí) và thử lưu/đọc lại file trong bucket `tts`.
// Tự bỏ qua khi thiếu khóa Azure hoặc Supabase.
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
vi.mock("server-only", () => ({}));
const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region, NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = process.env;
const enabled = Boolean(key && region && url && serviceKey);

describe.skipIf(!enabled)("giọng đọc Azure + kho lưu", () => {
  it("tổng hợp ra mp3 hợp lệ, lưu vào Storage rồi đọc lại đúng nội dung", async () => {
    const { synthesizeWithAzure } = await import("@/lib/tts/azure-speech");
    const { readStoredAudio, storeAudio, TTS_BUCKET } = await import("@/lib/tts/tts-audio-store");
    const { ttsStoragePath } = await import("@/lib/tts/tts-text");
    const sb = createClient(url!, serviceKey!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
    const text = "语音测试";

    const audio = await synthesizeWithAzure(text, key!, region!);
    expect(audio.length).toBeGreaterThan(1000);
    // mp3: bắt đầu bằng tag ID3 hoặc khung đồng bộ 0xFF 0xE?/0xF?
    expect(audio[0] === 0x49 || audio[0] === 0xff).toBe(true);

    await storeAudio(sb, text, audio);
    const back = await readStoredAudio(sb, text);
    expect(back?.equals(audio)).toBe(true);
    await sb.storage.from(TTS_BUCKET).remove([ttsStoragePath(text)]);
  });

  it("khóa sai bị từ chối bằng lỗi có kiểu, không lộ khóa", async () => {
    const { synthesizeWithAzure, TtsUnavailableError } = await import("@/lib/tts/azure-speech");
    await expect(synthesizeWithAzure("你好", "sai-khoa", region!)).rejects.toBeInstanceOf(TtsUnavailableError);
  });
});
