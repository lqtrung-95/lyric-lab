import { getCurrentUser } from "@/lib/auth/current-user";
import { translationSuggestionRequestSchema } from "@/lib/translations/translation-suggestion-schema";
import { InMemoryRateLimiter } from "@/lib/rate-limit/in-memory-rate-limiter";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export const runtime = "nodejs";

// 20 góp ý dịch/ngày/IP: cao hơn feedback vì mỗi câu một lượt gửi, nhưng vẫn chặn spam thô.
const limiter = new InMemoryRateLimiter(20, 24 * 60 * 60 * 1000);

/** POST {videoId, promptVersion, lineIndex, currentTranslation, suggestedTranslation} → lưu góp ý dịch, admin duyệt sau. */
export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!limiter.tryConsume(ip)) return Response.json({ error: "rate_limited" }, { status: 429 });

  const parsed = translationSuggestionRequestSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "invalid_request" }, { status: 400 });

  const user = await getCurrentUser();
  const { error } = await createSupabaseServiceClient().from("translation_suggestions").insert({
    video_id: parsed.data.videoId, prompt_version: parsed.data.promptVersion, line_index: parsed.data.lineIndex,
    current_translation: parsed.data.currentTranslation, suggested_translation: parsed.data.suggestedTranslation,
    user_id: user?.id ?? null,
  });
  if (error) {
    console.error(JSON.stringify({ event: "translation_suggestion_error", message: error.message }));
    return Response.json({ error: "server_error" }, { status: 500 });
  }
  return Response.json({ ok: true }, { status: 201 });
}
