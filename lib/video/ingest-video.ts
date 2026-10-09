import type { SupabaseClient } from "@supabase/supabase-js";
import { withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import type { CaptionProvider } from "@/lib/captions/caption-provider-types";
import { pickBestChineseTrack } from "@/lib/captions/pick-best-chinese-track";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { isUsableTranslationTrack } from "./align-translation";
import { averageLessonLevel, prepareLessonLines, termsToLookUp, toLessonLines, type PreparedLine } from "./build-lesson-lines";
import type { LessonStatus, TranslationSource } from "./video-lesson-types";
import type { VideoMeta } from "./youtube-data-api";

// Nạp MỘT video vào kho video luyện nghe (dùng chung cho script `scripts/ingest-video-source.mts` và API quản trị): chỉ nhận video nhúng được
// và có phụ đề tiếng Trung do người làm; bản dịch lấy từ track tiếng Việt thủ công (không gọi LLM); chia từ, pinyin, level từ từ điển.
// Không tải audio/video. Video mới vào ở trạng thái `draft`, chờ admin duyệt.

export type SkipReason = "exists" | "not_embeddable" | "no_human_zh_captions" | "no_lines";
export type IngestOutcome =
  | { kind: "ingested"; lineCount: number; translatedLineCount: number; levelAvg: number | null; refreshed: boolean; translationSource: TranslationSource }
  | { kind: "skipped"; reason: SkipReason };

export interface IngestDeps {
  sb: SupabaseClient;
  provider: CaptionProvider;
  /** Tra từ điển nhiều từ một lượt. */
  lookup: (terms: string[]) => Promise<Map<string, DictWordRow[]>>;
}

/** Tạo (hoặc cập nhật) bản ghi nguồn của kênh và trả id. */
export async function ensureSource(sb: SupabaseClient, channel: { id: string; title: string }, owned: boolean): Promise<string> {
  const { data, error } = await sb.from("video_sources")
    .upsert({ youtube_ref: channel.id, title: channel.title, owned, human_zh_captions: true }, { onConflict: "youtube_ref" }).select("id").single();
  if (error) throw new Error(`Ghi video_sources lỗi: ${error.message}`);
  return data.id as string;
}

/** Mã video đã có trong kho (mọi trạng thái). */
export async function existingVideoIds(sb: SupabaseClient, ids: string[]): Promise<Set<string>> {
  if (ids.length === 0) return new Set();
  const { data, error } = await sb.from("video_lessons").select("video_id").in("video_id", ids);
  if (error) throw new Error(`Đọc video_lessons lỗi: ${error.message}`);
  return new Set((data ?? []).map((r) => r.video_id as string));
}

export interface IngestInput {
  meta: VideoMeta;
  sourceId: string | null;
  refresh?: boolean;
  /** Trạng thái video mới (mặc định `draft`, chờ admin duyệt). Video người dùng tự thêm vào thẳng `listed`. */
  status?: LessonStatus;
  /** Người thêm (video người dùng tự thêm); null với video admin nạp. */
  addedBy?: string | null;
  /**
   * Chỉ dùng track tiếng Việt khi ghép đủ tốt (`isUsableTranslationTrack`); lệch dòng thì bỏ cả track thay vì giữ bản dịch lệch. Video người dùng thêm bật cờ này;
   * đường của admin để tắt (admin rà tay các dòng lệch).
   */
  requireGoodTranslationTrack?: boolean;
  /** Dịch các dòng còn chưa có bản dịch (ví dụ bằng LLM) sau khi ghép track tiếng Việt (nếu có); trả cùng số dòng, dòng dịch không được thì để null. */
  translateMissing?: (lines: PreparedLine[]) => Promise<PreparedLine[]>;
}

/**
 * Nạp một video. `refresh` làm mới dòng của video đã có (giữ nguyên trạng thái duyệt); không có thì video đã có bị bỏ qua.
 * Ném lỗi nếu tải phụ đề hoặc ghi DB thất bại (nơi gọi dùng `isTransientCaptionError` để quyết định có thử lại).
 */
export async function ingestVideo(deps: IngestDeps, input: IngestInput): Promise<IngestOutcome> {
  const { sb, provider, lookup } = deps;
  const { meta, sourceId, refresh = false, status = "draft", addedBy = null, requireGoodTranslationTrack = false, translateMissing } = input;
  if (!meta.embeddable) return { kind: "skipped", reason: "not_embeddable" };
  const exists = (await existingVideoIds(sb, [meta.videoId])).has(meta.videoId);
  if (exists && !refresh) return { kind: "skipped", reason: "exists" };

  const tracks = await provider.listTracks(meta.videoId);
  const zhTrack = pickBestChineseTrack(tracks);
  if (!zhTrack || zhTrack.kind !== "manual") return { kind: "skipped", reason: "no_human_zh_captions" };
  const viTrack = tracks.find((t) => t.lang.toLowerCase().startsWith("vi") && t.kind === "manual") ?? null;
  const zh = await provider.fetchLines(meta.videoId, zhTrack);
  const vi = viTrack ? await provider.fetchLines(meta.videoId, viTrack) : null;

  let prepared = prepareLessonLines(zh, vi);
  if (prepared.length === 0) return { kind: "skipped", reason: "no_lines" };
  let useVi = vi !== null;
  if (vi && requireGoodTranslationTrack && !isUsableTranslationTrack(prepared.length, vi.length, prepared.filter((l) => l.translation).length)) {
    prepared = prepareLessonLines(zh, null);
    useVi = false;
  }
  // Có track tiếng Việt thì dùng nó; vẫn nhờ nơi gọi dịch những dòng còn thiếu (không ghép được dòng nào thì không tốn lượt gọi).
  if (translateMissing && prepared.some((l) => !l.translation)) prepared = await translateMissing(prepared);
  const terms = termsToLookUp(prepared);
  const dictionary = await withSubwordEntries(lookup, await lookup(terms), terms);
  const lines = toLessonLines(prepared, dictionary);
  const translatedLineCount = lines.filter((l) => l.translation).length;
  const levelAvg = averageLessonLevel(prepared, dictionary);

  const translationSource: TranslationSource = useVi ? "youtube" : translateMissing && translatedLineCount > 0 ? "ai" : "none";
  const row = {
    video_id: meta.videoId, source_id: sourceId, title: meta.title, channel_title: meta.channelTitle, duration_sec: meta.durationSec, level_avg: levelAvg,
    translation_source: translationSource, line_count: lines.length, translated_line_count: translatedLineCount, lines, updated_at: new Date().toISOString(),
  };
  const { error } = exists
    ? await sb.from("video_lessons").update(row).eq("video_id", meta.videoId)
    : await sb.from("video_lessons").insert({ ...row, status, ...(addedBy ? { added_by: addedBy } : {}) });
  if (error) throw new Error(`Ghi video_lessons lỗi: ${error.message}`);
  return { kind: "ingested", lineCount: lines.length, translatedLineCount, levelAvg, refreshed: exists, translationSource };
}
