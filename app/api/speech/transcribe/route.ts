import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/current-user";
import { azureSpeechEndpoints } from "@/lib/env/server-env";
import { MAX_AUDIO_BASE64_CHARS } from "@/lib/pronunciation/feedback-schema";
import { looksLikeWav } from "@/lib/pronunciation/assess-request-schema";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { TranscribeUnavailableError, transcribeWithAzure } from "@/lib/speech/azure-transcribe";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(1000, 24 * 60 * 60 * 1000);
const bodySchema = z.object({ audio: z.string().min(100).max(MAX_AUDIO_BASE64_CHARS).regex(/^[A-Za-z0-9+/]+=*$/) });

/**
 * POST /api/speech/transcribe {audio(base64 WAV 16 kHz mono)} → {text}: chữ Hán nghe được (rỗng nếu không nghe thấy gì).
 * Dùng cho các bài Nói phản xạ. Tính vào hạn mức `stt`; lỗi phía hệ thống thì hoàn lại. Âm thanh không được lưu.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const body = await req.json().catch(() => null);
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const wav = Buffer.from(parsed.data.audio, "base64");
  if (!looksLikeWav(wav)) return Response.json({ error: "invalid_request" }, { status: 400 });
  const endpoints = azureSpeechEndpoints();
  if (endpoints.length === 0) return Response.json({ error: "transcribe_unavailable" }, { status: 503 });

  if (!ipLimiter.tryConsume(ip) || !(await consumeUsage(user, "stt"))) return Response.json({ error: "rate_limited" }, { status: 429 });
  let lastError: unknown;
  for (const { key, region } of endpoints) {
    try {
      return Response.json({ text: await transcribeWithAzure(wav, key, region) });
    } catch (error) {
      lastError = error;
    }
  }
  await refundUsage(user, "stt");
  if (lastError instanceof TranscribeUnavailableError) return Response.json({ error: "transcribe_unavailable" }, { status: 502 });
  console.error(JSON.stringify({ event: "transcribe_error", message: (lastError as Error)?.message }));
  return Response.json({ error: "server_error" }, { status: 500 });
}
