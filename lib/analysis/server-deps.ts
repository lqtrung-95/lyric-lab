import "server-only";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { getServerEnv } from "@/lib/env/server-env";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { EXPLAIN_LANG, LEARN_LANG, type AnalyzeStep, type AnalyzeVideoDeps } from "./analyze-video";
import { PROMPT_VERSION } from "./build-analysis-prompt";
import { createGroqChat } from "./groq-chat";
import { buildLinePinyin, withSubwordEntries } from "./build-line-pinyin";
import { simplifyDeep } from "./simplify-analysis";
import { getCachedAnalysis } from "./song-analysis-cache";
import { createSupabaseCacheDb } from "./supabase-cache-db";
import type { SongAnalysis } from "./analysis-types";

/** Ghép mọi phụ thuộc thật (Supabase service role, Groq, YouTube, LRCLIB) cho pipeline. Chỉ dùng ở server. */
export function createAnalyzeDeps(onProgress?: (step: AnalyzeStep) => void): AnalyzeVideoDeps {
  const sb = createSupabaseServiceClient();
  return {
    captions: new YoutubeInnertubeCaptionProvider(),
    lrclib: new LrclibProvider(),
    cache: createSupabaseCacheDb(sb),
    chat: createGroqChat(getServerEnv().GROQ_API_KEY),
    lookupDictionary: (terms) => lookupWords(sb as never, terms),
    lookupSinoViet: async (chars) => {
      const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
      return new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
    },
    onProgress,
  };
}

/** Đọc phân tích đã cache (khóa theo quy tắc 8), luôn ở dạng giản thể (xem `simplifyDeep`). */
export async function readCachedAnalysis(videoId: string): Promise<SongAnalysis | null> {
  const cache = createSupabaseCacheDb(createSupabaseServiceClient());
  const analysis = await getCachedAnalysis(cache, { videoId, learnLang: LEARN_LANG, explainLang: EXPLAIN_LANG, promptVersion: PROMPT_VERSION });
  return analysis ? repairLinePinyin(simplifyDeep(analysis)) : null;
}

const HAN = /\p{Script=Han}/u;

/**
 * Bài đã cache trước khi có cách ghép pinyin theo đoạn con có thể còn chữ Hán lẫn trong dòng pinyin (token như 好了吗
 * không có nguyên từ trong từ điển). Tính lại pinyin cho đúng những dòng đó từ token và từ điển, không gọi LLM.
 */
async function repairLinePinyin(analysis: SongAnalysis): Promise<SongAnalysis> {
  if (!analysis.lines.some((l) => HAN.test(l.pinyin))) return analysis;
  const sb = createSupabaseServiceClient();
  const lookup = (terms: string[]) => lookupWords(sb as never, terms);
  const words = analysis.lines.filter((l) => HAN.test(l.pinyin)).flatMap((l) => l.tokens.map((t) => t.text)).filter((w) => HAN.test(w));
  const dictionary = await withSubwordEntries(lookup, await lookup(words), words);
  return {
    ...analysis,
    lines: analysis.lines.map((l) =>
      HAN.test(l.pinyin) ? { ...l, pinyin: buildLinePinyin(l.tokens.map((t) => ({ text: t.text, simplified: t.text })), dictionary) } : l,
    ),
  };
}

/** Tiêu đề và kênh của bài đã lưu (để hiện ở giao diện). */
export async function readSongRow(videoId: string): Promise<{ title: string; channelTitle: string; durationSec: number } | null> {
  const { data } = await createSupabaseServiceClient()
    .from("songs").select("title,channel_title,duration_sec").eq("video_id", videoId).maybeSingle();
  return data ? { title: simplifyDeep(data.title), channelTitle: simplifyDeep(data.channel_title), durationSec: data.duration_sec } : null;
}
