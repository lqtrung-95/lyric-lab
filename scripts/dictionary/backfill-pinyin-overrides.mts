// Ghi thẳng vào DB pinyin đúng cho các dòng lời đã cache bị ảnh hưởng bởi COMMON_READING / MANUAL_VARIANTS (vd. 听
// từng ra "yǐn" thay vì "tīng", 著 từng ra "zhù" thay vì "zhe") — cùng logic với repairLinePinyin (server-deps.ts)
// nhưng ghi lại một lần thay vì tính lại mỗi lúc đọc, để không phải chờ ai mở bài mới tự sửa.
// Chạy: npx tsx --env-file=.env.local scripts/dictionary/backfill-pinyin-overrides.mts [--dry-run]
import { createClient } from "@supabase/supabase-js";
// supabase-js khởi tạo luôn realtime client, cần WebSocket toàn cục mà Node 20 chưa có sẵn (23+ mới có native).
import WebSocket from "ws";
(globalThis as { WebSocket?: unknown }).WebSocket ??= WebSocket;
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { buildLinePinyin, withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import { simplifyDeep } from "@/lib/analysis/simplify-analysis";
import { COMMON_READING, lookupWords } from "@/lib/dictionary/lookup-words";
import { MANUAL_VARIANTS } from "@/lib/text/to-simplified-chinese";

const dryRun = process.argv.includes("--dry-run");
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error("Thiếu NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY trong .env.local");
const supabase = createClient(url, key, { auth: { persistSession: false } });

const HAN = /\p{Script=Han}/u;
const OVERRIDE_CHARS = new Set([...Object.keys(COMMON_READING), ...Object.values(MANUAL_VARIANTS)]);
const needsPinyinRepair = (l: { text: string; pinyin: string }) => HAN.test(l.pinyin) || [...l.text].some((c) => OVERRIDE_CHARS.has(c));

const { data: rows, error } = await supabase.from("song_analyses").select("id,video_id,analysis");
if (error) throw new Error(error.message);
console.log(`Quét ${rows.length} bài đã cache…`);

let changedRows = 0;
let changedLines = 0;
for (const row of rows) {
  // Text trong DB có thể còn phồn thể (chuyển sang giản thể ở lúc đọc, không lưu lại) nên phải tự chuyển trước khi
  // tra từ điển, giống hệt loadAnalysis(server-deps.ts) làm lúc người dùng mở bài.
  const analysis = simplifyDeep(row.analysis as SongAnalysis);
  if (!analysis.lines.some(needsPinyinRepair)) continue;

  const lookup = (terms: string[]) => lookupWords(supabase as never, terms);
  const words = analysis.lines.filter(needsPinyinRepair).flatMap((l) => l.tokens.map((t) => t.text)).filter((w) => HAN.test(w));
  const dictionary = await withSubwordEntries(lookup, await lookup(words), words);

  let lineChanges = 0;
  const lines = analysis.lines.map((l) => {
    if (!needsPinyinRepair(l)) return l;
    const pinyin = buildLinePinyin(l.tokens.map((t) => ({ text: t.text, simplified: t.text })), dictionary);
    if (pinyin === l.pinyin) return l;
    lineChanges++;
    return { ...l, pinyin };
  });
  if (lineChanges === 0) continue;

  changedRows++;
  changedLines += lineChanges;
  console.log(`${row.video_id}: ${lineChanges} dòng`);
  if (!dryRun) {
    // Chỉ ghi lại pinyin, giữ nguyên mọi trường khác trong `analysis` (text vẫn để nguyên bản gốc theo đúng thiết
    // kế "chuyển giản thể ở lúc đọc, không lưu lại" đã có từ trước).
    const original = row.analysis as SongAnalysis;
    const patched: SongAnalysis = { ...original, lines: original.lines.map((l, i) => ({ ...l, pinyin: lines[i].pinyin })) };
    const { error: updateError } = await supabase.from("song_analyses").update({ analysis: patched }).eq("id", row.id);
    if (updateError) throw new Error(`Ghi ${row.video_id} lỗi: ${updateError.message}`);
  }
}

console.log(dryRun ? "(--dry-run, chưa ghi)" : "Đã ghi.", `${changedRows}/${rows.length} bài, ${changedLines} dòng được sửa.`);
