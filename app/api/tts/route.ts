import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage } from "@/lib/rate-limit/consume-usage";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { TtsUnavailableError, synthesizeWithAzure } from "@/lib/tts/azure-speech";
import { readStoredAudio, storeAudio } from "@/lib/tts/tts-audio-store";
import { normalizeTtsText } from "@/lib/tts/tts-text";

export const runtime = "nodejs";
export const maxDuration = 15;

// Âm thanh của một văn bản là bất biến (không chứa dữ liệu người dùng) nên cache công khai lâu dài.
const AUDIO_HEADERS = { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=31536000, immutable" };

/**
 * GET /api/tts?text=离开 → mp3 giọng thần kinh Azure. File đã tổng hợp được lưu trong Storage dùng chung: lần đầu một từ xuất hiện
 * mới gọi Azure (tính hạn mức theo tài khoản), các lần sau và mọi người khác chỉ đọc file đã lưu.
 */
export async function GET(req: Request) {
  const text = normalizeTtsText(new URL(req.url).searchParams.get("text"));
  if (!text) return Response.json({ error: "invalid_text" }, { status: 400 });

  const sb = createSupabaseServiceClient();
  const stored = await readStoredAudio(sb, text);
  if (stored) return new Response(new Uint8Array(stored), { headers: AUDIO_HEADERS });

  const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region } = getServerEnv();
  if (!key || !region) return Response.json({ error: "tts_not_configured" }, { status: 503 });

  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  if (!(await consumeUsage(user, "tts"))) return Response.json({ error: "rate_limited" }, { status: 429 });

  try {
    const audio = await synthesizeWithAzure(text, key, region);
    await storeAudio(sb, text, audio);
    return new Response(new Uint8Array(audio), { headers: AUDIO_HEADERS });
  } catch (error) {
    if (error instanceof TtsUnavailableError) return Response.json({ error: "tts_unavailable" }, { status: 502 });
    console.error(JSON.stringify({ event: "tts_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
