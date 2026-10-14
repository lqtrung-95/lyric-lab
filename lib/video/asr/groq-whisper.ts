import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import type { RawAsrSegment } from "./asr-lines";

// Whisper qua Groq: dùng trong script chạy trên máy admin (audio tải về máy, KHÔNG qua server của app). Trả các đoạn có mốc giờ tính từ đầu file.
const ENDPOINT = "https://api.groq.com/openai/v1/audio/transcriptions";
export const GROQ_WHISPER_MODEL = "whisper-large-v3-turbo";
/** Gợi ý mở đầu giúp Whisper ra chữ giản thể và có dấu câu. */
const PROMPT = "以下是普通话的句子。";
/** Groq giới hạn file 25 MB (gói miễn phí); chừa dư. */
export const GROQ_MAX_AUDIO_BYTES = 24 * 1024 * 1024;

interface WhisperSegment { start: number; end: number; text: string; avg_logprob?: number; no_speech_prob?: number; compression_ratio?: number }

/** Đoạn Whisper hay bịa khi gặp im lặng/nhạc: xác suất không có lời cao mà độ tin cậy thấp, hoặc nén quá nhiều (lặp chữ). */
export function isHallucinatedWhisperSegment(s: WhisperSegment): boolean {
  if ((s.compression_ratio ?? 0) > 2.4) return true;
  return (s.no_speech_prob ?? 0) > 0.6 && (s.avg_logprob ?? 0) < -1;
}

export function whisperSegmentsToRaw(segments: WhisperSegment[], offsetSec = 0): RawAsrSegment[] {
  return segments.filter((s) => !isHallucinatedWhisperSegment(s)).map((s) => ({ start: s.start + offsetSec, end: s.end + offsetSec, text: toSimplifiedChinese(s.text) }));
}

export async function transcribeWithGroq(audio: Uint8Array, fileName: string, apiKey: string, fetchFn: typeof fetch = fetch): Promise<WhisperSegment[]> {
  const form = new FormData();
  form.set("file", new Blob([audio as BlobPart]), fileName);
  form.set("model", GROQ_WHISPER_MODEL);
  form.set("language", "zh");
  form.set("response_format", "verbose_json");
  form.set("timestamp_granularities[]", "segment");
  form.set("temperature", "0");
  form.set("prompt", PROMPT);
  const res = await fetchFn(ENDPOINT, { method: "POST", headers: { Authorization: `Bearer ${apiKey}` }, body: form, signal: AbortSignal.timeout(180_000) });
  if (!res.ok) throw new Error(`Groq Whisper ${res.status}: ${(await res.text().catch(() => "")).slice(0, 200)}`);
  const body = (await res.json()) as { segments?: WhisperSegment[] };
  return body.segments ?? [];
}
