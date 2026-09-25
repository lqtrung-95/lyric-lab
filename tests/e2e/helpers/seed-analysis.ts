import { existsSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { PROMPT_VERSION } from "@/lib/analysis/build-analysis-prompt";
import { yeCheAnalysis } from "@/lib/preview/fixtures/ye-che-analysis";

// videoId riêng cho E2E (đúng định dạng 11 ký tự, không trùng video thật).
export const E2E_VIDEO_ID = "e2eFixture1";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");

export const hasSupabaseEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

const client = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
    realtime: { transport: ws as never },
  });

/** Ghi bài hư cấu 夜车 vào cache thật của Supabase để test luồng đọc từ DB đầu-cuối. */
export async function seedFixtureSong() {
  const sb = client();
  const { error: songError } = await sb.from("songs").upsert(
    { video_id: E2E_VIDEO_ID, title: "Bài mẫu E2E", channel_title: "Kênh mẫu", duration_sec: 30 },
    { onConflict: "video_id" },
  );
  if (songError) throw new Error(`Seed songs: ${songError.message}`);
  const { error } = await sb.from("song_analyses").upsert(
    {
      video_id: E2E_VIDEO_ID, learn_lang: "zh", explain_lang: "vi", prompt_version: PROMPT_VERSION,
      lyrics_source: "lrclib", model: "fixture", analysis: { ...yeCheAnalysis, videoId: E2E_VIDEO_ID },
    },
    { onConflict: "video_id,learn_lang,explain_lang,prompt_version" },
  );
  if (error) throw new Error(`Seed song_analyses: ${error.message}`);
}

/** Xóa bài E2E (xóa cascade cả phân tích). */
export async function removeFixtureSong() {
  await client().from("songs").delete().eq("video_id", E2E_VIDEO_ID);
}

/** Client service role cho test cần đọc/dọn dữ liệu người dùng thật. */
export const serviceClientForTests = client;
