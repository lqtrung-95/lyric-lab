import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { consumeUsage, refundUsage } from "@/lib/rate-limit/consume-usage";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { assessRequestSchema, looksLikeWav } from "@/lib/pronunciation/assess-request-schema";
import { AssessmentError } from "@/lib/pronunciation/assessment-normalize";
import { AssessmentUnavailableError, assessWithAzure } from "@/lib/pronunciation/azure-assessment";

export const runtime = "nodejs";
export const maxDuration = 30;

const ipLimiter = new InMemoryRateLimiter(500, 24 * 60 * 60 * 1000);

/**
 * POST /api/pronunciation-assess {text, audio(base64 WAV 16 kHz mono)} → điểm từng chữ so với câu `text` (Azure Pronunciation Assessment).
 * Chỉ chạy khi người học bấm nút; tính vào hạn mức `voice`, hoàn lại nếu lỗi phía hệ thống. Âm thanh không được lưu.
 */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }
  const user = await getCurrentUser();
  if (!user) return Response.json({ error: "auth_required" }, { status: 401 });
  const parsed = assessRequestSchema.safeParse(body);
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });
  const wav = Buffer.from(parsed.data.audio, "base64");
  if (!looksLikeWav(wav)) return Response.json({ error: "invalid_request" }, { status: 400 });
  const { AZURE_SPEECH_KEY: key, AZURE_SPEECH_REGION: region } = getServerEnv();
  if (!key || !region) return Response.json({ error: "assessment_unavailable" }, { status: 503 });

  if (!ipLimiter.tryConsume(ip) || !(await consumeUsage(user, "voice"))) return Response.json({ error: "rate_limited" }, { status: 429 });
  try {
    const started = Date.now();
    const result = await assessWithAzure(wav, parsed.data.text, key, region);
    console.info(JSON.stringify({ event: "pronunciation_assess", chars: result.syllables.length, overall: result.overall, ms: Date.now() - started }));
    return Response.json(result);
  } catch (error) {
    if (error instanceof AssessmentError && error.code === "no_speech") return Response.json({ error: "no_speech" }, { status: 422 });
    await refundUsage(user, "voice");
    if (error instanceof AssessmentUnavailableError) return Response.json({ error: "assessment_unavailable" }, { status: 502 });
    console.error(JSON.stringify({ event: "pronunciation_assess_error", message: (error as Error)?.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
}
