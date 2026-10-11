// Tính lại `video_lessons.level_avg` theo cách đo mới (độ khó từ vựng + tốc độ nói, xem lib/video/lesson-difficulty.ts) cho các video đã nạp trước đó.
// Mặc định chỉ in bảng so sánh cũ → mới (không ghi). Thêm --apply để ghi vào DB:
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-video-levels.mts            (xem trước)
//   NODE_OPTIONS=--experimental-websocket npx tsx scripts/backfill-video-levels.mts --apply    (ghi)
import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";
import ws from "ws";
import { lookupWords, pickPrimaryEntry } from "../lib/dictionary/lookup-words";
import { clampLineSeconds, estimateLessonLevel } from "../lib/video/lesson-difficulty";
import { bandOfLevel } from "../lib/video/video-level-filter";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const HAN = /\p{Script=Han}/u;

const { data, error } = await sb.from("video_lessons").select("video_id,title,level_avg,lines");
if (error) throw new Error(error.message);
const rows = (data ?? []) as { video_id: string; title: string; level_avg: number | null; lines: { start: number; end: number; text: string; tokens: { text: string }[] }[] }[];

const terms = new Set<string>();
for (const r of rows) for (const l of r.lines) for (const t of l.tokens) if (HAN.test(t.text)) terms.add(t.text);
const dictionary = await lookupWords(sb as never, [...terms]);

const results = rows.map((r) => {
  const tokenLevels: (number | null)[] = [];
  let hanChars = 0;
  let speakingSeconds = 0;
  for (const l of r.lines) {
    speakingSeconds += clampLineSeconds(l.end - l.start);
    hanChars += [...l.text].filter((c) => HAN.test(c)).length;
    for (const t of l.tokens) if (HAN.test(t.text)) { const lv = pickPrimaryEntry(dictionary.get(t.text) ?? [])?.hsk_level; tokenLevels.push(typeof lv === "number" ? lv : null); }
  }
  return { id: r.video_id, title: r.title.slice(0, 40), old: r.level_avg, next: estimateLessonLevel({ tokenLevels, hanChars, speakingSeconds }) };
}).sort((a, b) => (a.next ?? 99) - (b.next ?? 99));

console.table(results);
const bands: Record<string, number> = {};
for (const r of results) { const b = bandOfLevel(r.next) ?? "chưa có"; bands[b] = (bands[b] ?? 0) + 1; }
console.log("Phân bố dải mới:", bands);

if (apply) {
  let updated = 0;
  for (const r of results) {
    const { error: e } = await sb.from("video_lessons").update({ level_avg: r.next }).eq("video_id", r.id);
    if (e) console.error(r.id, e.message); else updated++;
  }
  console.log(`Đã cập nhật level_avg cho ${updated}/${results.length} video`);
} else {
  console.log("Chưa ghi gì (thêm --apply để ghi).");
}
