import { z } from "zod";
import { DEFAULT_MODELS } from "@/lib/analysis/analyze-lyrics";
import { GEMINI_MODELS } from "@/lib/analysis/gemini-models";
import { createChat } from "@/lib/analysis/server-deps";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { retranslateLine } from "@/lib/video/retranslate-line";
import { decideReportAction } from "@/lib/video/translation-report";
import type { LessonLine, TranslationSource } from "@/lib/video/video-lesson-types";
import { isValidVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
// Một lần gọi LLM cho đúng một dòng (có model dự phòng): nằm gọn trong 60 giây của gói Hobby.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const bodySchema = z.object({ lineIndex: z.number().int().min(0).max(100_000) });
const fail = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
const ok = (body: Record<string, unknown>) => Response.json(body, { headers: { "Cache-Control": "private, no-store" } });

/**
 * POST {lineIndex} → người học báo bản dịch một dòng của video là sai.
 * Trả {kind:"retranslated", translation} (AI đã dịch lại dòng đó, đã lưu cho mọi người), {kind:"reported"} (đã ghi nhận cho quản trị: dòng đã là bản AI hoặc admin đã xác nhận,
 * hết trần dịch lại hôm nay, hoặc model không cho được bản tốt hơn) hoặc {kind:"duplicate"} (người này đã báo dòng này rồi).
 * Lỗi: 400 invalid_request, 401 unauthorized, 404 not_found, 429 user_limit.
 */
export async function POST(req: Request, { params }: { params: Promise<{ videoId: string }> }) {
  const { videoId } = await params;
  if (!isValidVideoId(videoId)) return fail("not_found", 404);
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("invalid_request", 400);
  const { lineIndex } = parsed.data;

  try {
    const sb = createSupabaseServiceClient();
    const { data, error } = await sb.from("video_lessons").select("lines, translation_source").eq("video_id", videoId).neq("status", "hidden").maybeSingle();
    if (error) throw new Error(`đọc video: ${error.message}`);
    if (!data) return fail("not_found", 404);
    const lines = (data as unknown as { lines: LessonLine[]; translation_source: TranslationSource }).lines;
    const source = (data as unknown as { translation_source: TranslationSource }).translation_source;
    const line = lines.find((l) => l.idx === lineIndex);
    if (!line?.translation) return fail("not_found", 404);

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const count = async (build: (q: ReturnType<typeof base>) => ReturnType<typeof base>) => {
      const { count: n, error: e } = await build(base());
      if (e) throw new Error(`đếm báo cáo: ${e.message}`);
      return n ?? 0;
    };
    const base = () => sb.from("video_translation_reports").select("id", { count: "exact", head: true }).gte("created_at", since);
    const decision = decideReportAction({
      alreadyReportedByUser: (await count((q) => q.eq("user_id", user.id).eq("video_id", videoId).eq("line_idx", lineIndex))) > 0,
      userReportsToday: await count((q) => q.eq("user_id", user.id)),
      aiRetranslationsToday: await count((q) => q.eq("outcome", "retranslated")),
      lineLockedFromAi: line.translationBy !== undefined || source === "ai",
    });
    if (decision === "duplicate") return ok({ kind: "duplicate" });
    if (decision === "user_limit") return fail("user_limit", 429);

    let translation: string | null = null;
    if (decision === "retranslate") {
      translation = await retranslateLine(createChat(getServerEnv()), [...GEMINI_MODELS, ...DEFAULT_MODELS], lines, lines.findIndex((l) => l.idx === lineIndex));
      if (translation) {
        const next = lines.map((l) => (l.idx === lineIndex ? { ...l, translation, translationBy: "ai" as const } : l));
        const { error: updateError } = await sb.from("video_lessons").update({ lines: next, updated_at: new Date().toISOString() }).eq("video_id", videoId);
        if (updateError) throw new Error(`ghi bản dịch mới: ${updateError.message}`);
      }
    }
    const { error: insertError } = await sb.from("video_translation_reports").insert({
      video_id: videoId, line_idx: lineIndex, user_id: user.id, old_translation: line.translation, outcome: translation ? "retranslated" : "reported",
    });
    if (insertError) throw new Error(`ghi báo cáo: ${insertError.message}`);
    return ok(translation ? { kind: "retranslated", translation } : { kind: "reported" });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_translation_report_error", videoId, lineIndex, message: (error as Error)?.message }));
    return fail("server_error", 500);
  }
}
