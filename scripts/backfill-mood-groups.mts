// Điền `songs.mood_groups` cho các bài đã phân tích (gộp tag cảm xúc của AI thành nhóm cố định). Chạy một lần sau migration song_mood_groups:
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-mood-groups.mts          # ghi vào DB
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-mood-groups.mts --dry    # chỉ báo cáo độ phủ, không ghi (chạy được trước migration)
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { MOOD_GROUPS, moodGroupsForSong } from "../lib/library/mood-groups";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const dry = process.argv.includes("--dry");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }, realtime: { transport: ws as never },
});

const { data, error } = await sb.from("song_analyses").select("video_id,analysis");
if (error) throw new Error(error.message);

const perGroup = new Map<string, number>();
const uncovered = new Map<string, number>();
let withGroup = 0;
let updated = 0;
const seen = new Set<string>();
for (const row of data ?? []) {
  if (seen.has(row.video_id)) continue; // một bài có thể có nhiều bản phân tích (phiên bản prompt): lấy bản đầu
  seen.add(row.video_id);
  const moods = (row.analysis as { moods?: string[] }).moods ?? [];
  const groups = moodGroupsForSong(moods);
  if (groups.length) withGroup++;
  else for (const m of moods) uncovered.set(m.toLowerCase(), (uncovered.get(m.toLowerCase()) ?? 0) + 1);
  for (const g of groups) perGroup.set(g, (perGroup.get(g) ?? 0) + 1);
  if (dry) continue;
  const { error: e } = await sb.from("songs").update({ mood_groups: groups }).eq("video_id", row.video_id);
  if (e) console.error(row.video_id, e.message);
  else updated++;
}

console.log(`${seen.size} bài, ${withGroup} bài có ít nhất một nhóm (${Math.round((100 * withGroup) / Math.max(1, seen.size))}%)`);
for (const g of MOOD_GROUPS) console.log(`  ${g.label}: ${perGroup.get(g.id) ?? 0} bài`);
const top = [...uncovered.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([m, c]) => `${m} (${c})`).join(", ");
if (top) console.log(`Tag của các bài chưa có nhóm (nhiều nhất): ${top}`);
console.log(dry ? "Chạy thử (--dry): chưa ghi gì." : `Đã cập nhật mood_groups cho ${updated}/${seen.size} bài`);
