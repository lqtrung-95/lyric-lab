import type { SupabaseClient } from "@supabase/supabase-js";
import type { CacheDb } from "./song-analysis-cache";

/** Nối CacheDb với Supabase. Cần client service role (bảng cache không có policy cho anon). */
export function createSupabaseCacheDb(sb: SupabaseClient): CacheDb {
  return {
    selectAnalysis: (k) =>
      sb.from("song_analyses").select("analysis").eq("video_id", k.videoId).eq("learn_lang", k.learnLang)
        .eq("explain_lang", k.explainLang).eq("prompt_version", k.promptVersion).limit(1) as never,
    upsertSong: (row) => sb.from("songs").upsert(row, { onConflict: "video_id" }) as never,
    upsertAnalysis: (row) =>
      sb.from("song_analyses").upsert(row, { onConflict: "video_id,learn_lang,explain_lang,prompt_version" }) as never,
  };
}
