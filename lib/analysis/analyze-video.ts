import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { getLyricsForVideo, type LyricsDeps } from "@/lib/lyrics/get-lyrics-for-video";
import type { VideoMeta } from "@/lib/lyrics/lyrics-types";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import type { SongAnalysis } from "./analysis-types";
import { analyzeLyrics, type AnalyzeAttempt } from "./analyze-lyrics";
import { PROMPT_VERSION } from "./build-analysis-prompt";
import { buildVocabCandidates } from "./build-vocab-candidates";
import type { ChatFn } from "./groq-chat";
import { getCachedAnalysis, saveAnalysis, type CacheDb, type CacheKey } from "./song-analysis-cache";
import { collectHanTerms, tokenizeLyricLines } from "./tokenize-lyric-lines";

export const LEARN_LANG = "zh";
export const EXPLAIN_LANG = "vi";

export interface AnalyzeVideoDeps extends LyricsDeps {
  cache: CacheDb;
  chat: ChatFn;
  lookupDictionary(terms: string[]): Promise<Map<string, DictWordRow[]>>;
  /** Bảng âm Hán Việt cho các chữ phồn thể cho trước. */
  lookupSinoViet(chars: string[]): Promise<Map<string, string[]>>;
  models?: string[];
}

export interface AnalyzeVideoResult {
  analysis: SongAnalysis;
  fromCache: boolean;
  attempts: AnalyzeAttempt[];
}

/** Toàn bộ pipeline cho một video: cache → lời → chuẩn hóa → tách từ → từ điển → LLM → validate → lưu cache. */
export async function analyzeVideo(video: VideoMeta, deps: AnalyzeVideoDeps): Promise<AnalyzeVideoResult> {
  const key: CacheKey = { videoId: video.videoId, learnLang: LEARN_LANG, explainLang: EXPLAIN_LANG, promptVersion: PROMPT_VERSION };

  const cached = await getCachedAnalysis(deps.cache, key);
  if (cached) return { analysis: cached, fromCache: true, attempts: [] };

  const lyrics = await getLyricsForVideo(video, deps);
  const lines = tokenizeLyricLines(normalizeLyricLines(lyrics.lines));
  const dictionary = await deps.lookupDictionary(collectHanTerms(lines));
  const candidates = buildVocabCandidates(lines, dictionary);
  const chars = [...new Set(candidates.flatMap((c) => [...c.traditional]))];
  const sinoViet = await deps.lookupSinoViet(chars);

  const { analysis, attempts } = await analyzeLyrics({
    videoId: video.videoId, lyricsSource: lyrics.source, lines, candidates, dictionary, sinoViet,
    chat: deps.chat, models: deps.models,
  });
  await saveAnalysis(deps.cache, key, video, analysis);
  return { analysis, fromCache: false, attempts };
}
