import type { SongAnalysis } from "./analysis-types";
import { averageVocabLevel } from "./song-level-average";
import type { VideoMeta } from "@/lib/lyrics/lyrics-types";

/** Khóa cache (quy tắc 8): videoId + ngôn ngữ học + ngôn ngữ giải thích + phiên bản prompt. */
export interface CacheKey {
  videoId: string;
  learnLang: string;
  explainLang: string;
  promptVersion: string;
}

type DbResult<T> = PromiseLike<{ data: T; error: { message: string } | null }>;

/** Phần tối thiểu của Supabase client mà cache cần (để test bằng đối tượng giả). */
export interface CacheDb {
  selectAnalysis(key: CacheKey): DbResult<{ analysis: SongAnalysis }[] | null>;
  upsertSong(row: { video_id: string; title: string; channel_title: string; duration_sec: number; level_avg: number | null }): DbResult<unknown>;
  upsertAnalysis(row: {
    video_id: string; learn_lang: string; explain_lang: string; prompt_version: string;
    lyrics_source: string; model: string; analysis: SongAnalysis;
  }): DbResult<unknown>;
}

export async function getCachedAnalysis(db: CacheDb, key: CacheKey): Promise<SongAnalysis | null> {
  const { data, error } = await db.selectAnalysis(key);
  if (error) throw new Error(`Đọc cache lỗi: ${error.message}`);
  return data?.[0]?.analysis ?? null;
}

export async function saveAnalysis(db: CacheDb, key: CacheKey, video: VideoMeta, analysis: SongAnalysis): Promise<void> {
  const song = await db.upsertSong({
    video_id: video.videoId, title: video.title, channel_title: video.channelTitle, duration_sec: video.durationSec,
    level_avg: averageVocabLevel(analysis.items),
  });
  if (song.error) throw new Error(`Ghi bài hát lỗi: ${song.error.message}`);
  const saved = await db.upsertAnalysis({
    video_id: key.videoId, learn_lang: key.learnLang, explain_lang: key.explainLang, prompt_version: key.promptVersion,
    lyrics_source: analysis.lyricsSource, model: analysis.model, analysis,
  });
  if (saved.error) throw new Error(`Ghi phân tích lỗi: ${saved.error.message}`);
}
