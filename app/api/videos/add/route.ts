import { z } from "zod";
import { createChat } from "@/lib/analysis/server-deps";
import { getCurrentUser } from "@/lib/auth/current-user";
import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { getServerEnv } from "@/lib/env/server-env";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { isAdminAccount } from "@/lib/admin/admin-accounts";
import { decideAddLimit, decideDuration, decideTranslationBudget } from "@/lib/video/add-video-limits";
import { isMostlyChinese } from "@/lib/video/chinese-ratio";
import { FixedCaptionProvider } from "@/lib/video/fixed-caption-provider";
import { ingestVideo } from "@/lib/video/ingest-video";
import { stripPinyinFromLines } from "@/lib/video/strip-pinyin";
import { MAX_TRANSCRIPT_LINES, parsePastedTranscript } from "@/lib/video/parse-pasted-transcript";
import { SupadataError, fetchSupadataLines } from "@/lib/video/supadata-transcript";
import { translateLines } from "@/lib/video/translate-lines";
import { fetchVideosMeta } from "@/lib/video/youtube-data-api";
import { parseVideoId } from "@/lib/youtube/parse-video-id";

export const runtime = "nodejs";
// Một video mỗi lần (đọc thông tin video, lấy phụ đề, dịch theo đoạn song song, tra từ điển): nằm trong 60 giây của gói Hobby.
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const lineSchema = z.object({ text: z.string().min(1).max(300), start: z.number().min(0), end: z.number().min(0) });
const bodySchema = z.object({
  // Link YouTube hoặc mã video 11 ký tự.
  video: z.string().min(1).max(300),
  // Phụ đề dán vào (SRT/VTT/bản chép lời của YouTube) hoặc các dòng do bookmarklet gửi sang; bỏ trống thì thử lấy tự động nếu máy chủ có khóa Supadata.
  captions: z.string().max(400_000).optional(),
  // Phụ đề tiếng Việt của track do người làm (dấu trang gửi kèm): ghép làm bản dịch thay vì nhờ AI. Chỉ có nghĩa khi đi cùng `captions`.
  // Dấu trang cũ (đã kéo lên thanh dấu trang của người dùng) còn gửi kèm phụ đề tiếng Việt: nhận nhưng BỎ QUA, bản dịch luôn do AI.
  viCaptions: z.string().max(400_000).optional(),
  lines: z.array(lineSchema).max(MAX_TRANSCRIPT_LINES).optional(),
});

const fail = (error: string, status: number) => Response.json({ error }, { status, headers: { "Cache-Control": "private, no-store" } });
const ok = (body: Record<string, unknown>) => Response.json(body, { headers: { "Cache-Control": "private, no-store" } });

/**
 * POST {video, captions? | lines?} → thêm một video vào kho dùng chung, hiện ngay cho mọi người (admin ẩn/xóa được sau).
 * Trả {kind:"added", videoId, lineCount, translatedLineCount, translation: "youtube"|"ai"|"none", aiBudgetExhausted} | {kind:"exists", videoId} | {kind:"skipped", reason}; lỗi: 400 invalid_video/invalid_captions,
 * 401 unauthorized, 404 video_not_found, 413 too_long, 422 too_short/unavailable/captions_required/no_chinese_captions/not_chinese, 429 user_limit/global_limit, 503 fetch_unavailable.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("unauthorized", 401);
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("invalid_video", 400);
  const videoId = parseVideoId(parsed.data.video);
  if (!videoId) return fail("invalid_video", 400);

  try {
    const env = getServerEnv();
    const sb = createSupabaseServiceClient();
    const { data: existing } = await sb.from("video_lessons").select("status").eq("video_id", videoId).maybeSingle();
    if (existing) return existing.status === "hidden" ? fail("unavailable", 422) : ok({ kind: "exists", videoId });

    const meta = (await fetchVideosMeta([videoId], env.YOUTUBE_DATA_API_KEY)).get(videoId);
    if (!meta) return fail("video_not_found", 404);
    if (!meta.embeddable) return ok({ kind: "skipped", reason: "not_embeddable" });
    const duration = decideDuration(meta.durationSec);
    if (duration !== "ok") return fail(duration, duration === "too_long" ? 413 : 422);

    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const count = async (byUser: boolean) => {
      const base = sb.from("video_lessons").select("video_id", { count: "exact", head: true }).gte("created_at", since);
      const { count: n, error } = await (byUser ? base.eq("added_by", user.id) : base.not("added_by", "is", null));
      // Không đếm được (ví dụ migration `added_by` chưa chạy) thì báo lỗi, không được coi như chưa ai thêm rồi bỏ qua giới hạn.
      if (error) throw new Error(`đếm video đã thêm: ${error.message}`);
      return n ?? 0;
    };
    const admin = isAdminAccount(user.email ?? null);
    // Admin không bị giới hạn số video, nên khỏi đếm.
    const limit = admin ? "ok" : decideAddLimit(await count(true), await count(false));
    if (limit !== "ok") return fail(limit, 429);

    // Ngân sách AI dịch toàn app (theo phút video): hết thì vẫn thêm video nhưng không nhờ AI dịch, admin dịch bù sau. Video dùng được phụ đề tiếng Việt có sẵn không tốn AI.
    const { data: aiVideos, error: budgetError } = await sb.from("video_lessons").select("duration_sec").not("added_by", "is", null).eq("translation_source", "ai").gte("created_at", since);
    if (budgetError) throw new Error(`đếm ngân sách dịch: ${budgetError.message}`);
    const usedMinutes = ((aiVideos ?? []) as { duration_sec: number }[]).reduce((sum, v) => sum + v.duration_sec / 60, 0);
    const canTranslate = decideTranslationBudget(usedMinutes, meta.durationSec) === "ok";

    let lines: CaptionLine[] = parsed.data.lines ?? (parsed.data.captions ? parsePastedTranscript(parsed.data.captions, meta.durationSec) : []);
    if (lines.length === 0 && (parsed.data.captions || parsed.data.lines)) return fail("invalid_captions", 400);
    if (lines.length === 0) {
      if (!env.SUPADATA_API_KEY) return fail("captions_required", 422);
      const zh = await fetchSupadataLines(videoId, env.SUPADATA_API_KEY, "zh");
      lines = zh.lines;
      if (lines.length === 0) return fail("no_chinese_captions", 422);
    }

    // Phụ đề song ngữ chen pinyin cùng dòng: bỏ pinyin trước khi đo tỉ lệ chữ Hán (pinyin dài làm tỉ lệ tụt oan).
    lines = stripPinyinFromLines(lines);
    if (lines.length === 0) return fail("invalid_captions", 400);

    // Bản chép lời của YouTube hay mặc định sang ngôn ngữ giao diện của người xem: không phải tiếng Trung thì dừng, không tốn lượt dịch.
    if (!isMostlyChinese(lines)) return fail("not_chinese", 422);

    const chat = createChat(env);
    const outcome = await ingestVideo(
      { sb, provider: new FixedCaptionProvider(lines, "zh-Hans"), lookup: (terms) => lookupWords(sb as never, terms) },
      { meta, sourceId: null, status: "listed", addedBy: user.id, translateMissing: canTranslate ? (prepared) => translateLines(prepared, chat, undefined, { title: meta.title }) : undefined },
    );
    if (outcome.kind === "skipped") return ok({ kind: "skipped", reason: outcome.reason });
    return ok({ kind: "added", videoId, lineCount: outcome.lineCount, translatedLineCount: outcome.translatedLineCount, translation: outcome.translationSource, aiBudgetExhausted: !canTranslate });
  } catch (error) {
    console.error(JSON.stringify({ event: "video_add_error", videoId, message: (error as Error)?.message }));
    // Hết credit hoặc bị giới hạn tốc độ ở dịch vụ lấy phụ đề: người dùng vẫn dán phụ đề thủ công được.
    if (error instanceof SupadataError) return fail("fetch_unavailable", 503);
    return fail("server_error", 500);
  }
}
