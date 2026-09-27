// Dọn bài phân tích nhiễu. Mặc định chỉ XEM (dry-run), không đổi gì:
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/prune-songs.mts
// --hide    ẩn khỏi Khám phá mọi bài chất lượng thấp hoặc bị báo sai (giữ nguyên bản phân tích)
// --delete  xóa hẳn bản phân tích của các bài như trên nếu KHÔNG ai còn dùng (không thẻ, không tiến độ nghe); bài còn người dùng chỉ bị ẩn
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { assessAnalysisQuality } from "../lib/analysis/analysis-quality";
import { SONG_REPORT_HIDE_THRESHOLD } from "../lib/analysis/song-report-reasons";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }, realtime: { transport: ws as never },
});
const mode = process.argv.includes("--delete") ? "delete" : process.argv.includes("--hide") ? "hide" : "dry-run";

const count = async (table: string, videoId: string) =>
  (await sb.from(table).select("*", { count: "exact", head: true }).eq("video_id", videoId)).count ?? 0;

const { data: analyses, error } = await sb.from("song_analyses").select("video_id,analysis");
if (error) throw new Error(error.message);
const { data: songs } = await sb.from("songs").select("video_id,title,listed");
const songById = new Map((songs ?? []).map((s) => [s.video_id as string, s]));

let flagged = 0;
for (const row of analyses ?? []) {
  const id = row.video_id as string;
  const issues: string[] = assessAnalysisQuality(row.analysis as never);
  const reports = await count("song_reports", id);
  if (reports >= SONG_REPORT_HIDE_THRESHOLD) issues.push(`reports:${reports}`);
  if (issues.length === 0) continue;
  flagged++;

  const [cards, progress] = await Promise.all([count("user_cards", id), count("user_song_progress", id)]);
  const inUse = cards + progress > 0;
  const song = songById.get(id);
  const action = mode === "delete" && !inUse ? "XÓA" : mode === "dry-run" ? "(xem)" : "ẨN";
  console.log(`${action.padEnd(5)} ${id} · ${song?.title ?? "?"} · ${issues.join(",")} · thẻ:${cards} nghe:${progress}${song?.listed === false ? " · đã ẩn" : ""}`);

  if (mode === "dry-run") continue;
  if (mode === "delete" && !inUse) await sb.from("songs").delete().eq("video_id", id); // cascade xóa phân tích và báo cáo
  else await sb.from("songs").update({ listed: false }).eq("video_id", id);
}
console.log(`\n${flagged}/${analyses?.length ?? 0} bài có vấn đề. Chế độ: ${mode}.`);
