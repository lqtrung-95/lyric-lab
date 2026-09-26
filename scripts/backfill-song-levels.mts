// Tính `level_avg` cho các bài đã phân tích trước khi có cột này. Chạy một lần sau migration discover_songs:
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-song-levels.mts
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { averageVocabLevel } from "../lib/analysis/song-level-average";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }, realtime: { transport: ws as never },
});

const { data, error } = await sb.from("song_analyses").select("video_id,analysis");
if (error) throw new Error(error.message);
let updated = 0;
for (const row of data ?? []) {
  const avg = averageVocabLevel((row.analysis as { items: never[] }).items ?? []);
  const { error: e } = await sb.from("songs").update({ level_avg: avg }).eq("video_id", row.video_id);
  if (e) console.error(row.video_id, e.message);
  else updated++;
}
console.log(`Đã cập nhật level_avg cho ${updated}/${data?.length ?? 0} bài`);
