// Tính lại pinyin cho các bài đã phân tích trước khi sửa lỗi chữ nhiều âm (都/还/说 chọn nhầm mục — xem
// lib/dictionary/lookup-words.ts và lib/dictionary/parse-hsk-vocabulary.ts). Không gọi LLM, chỉ tra lại từ điển.
// Mặc định chỉ xem (dry-run):
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/backfill-pinyin.mts
// Thêm --apply để ghi vào DB.
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { AnalyzedLine, SongAnalysis } from "@/lib/analysis/analysis-types";
import { buildLinePinyin, withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import { simplifyDeep } from "@/lib/analysis/simplify-analysis";
import { lookupWords } from "@/lib/dictionary/lookup-words";

const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const lookup = (terms: string[]) => lookupWords(sb as never, terms);

const { data, error } = await sb.from("song_analyses").select("video_id,learn_lang,explain_lang,prompt_version,analysis");
if (error) throw new Error(error.message);
const rows = data ?? [];

// Lời từ LRCLIB/caption lưu trong DB có thể còn phồn thể (chuyển giản thể lúc ĐỌC bằng simplifyDeep, xem
// lib/analysis/simplify-analysis.ts — không lưu sẵn dạng giản thể). Phải giản thể hoá trước khi tra từ điển
// (khoá bằng giản thể), không thì chữ phồn thể tra trật lất, in nguyên chữ Hán ra chỗ pinyin.
const simplifiedRows = rows.map((r) => ({ row: r, simplified: simplifyDeep(r.analysis as SongAnalysis) }));

// Tra 1 lượt cho mọi chữ xuất hiện trong toàn bộ bài, đỡ tra lặp lại theo từng bài.
const allWords = [...new Set(simplifiedRows.flatMap(({ simplified }) => simplified.lines.flatMap((l: AnalyzedLine) => l.tokens.map((t) => t.text))))];
const base = await lookup(allWords);
const dictionary = await withSubwordEntries(lookup, base, allWords);

let changedSongs = 0;
let changedLines = 0;
for (const { row, simplified } of simplifiedRows) {
  const a = row.analysis as SongAnalysis;
  const lines = a.lines.map((l, i) => ({ ...l, pinyin: buildLinePinyin(simplified.lines[i].tokens.map((t) => ({ text: t.text, simplified: t.text })), dictionary) }));
  const diff = lines.filter((l, i) => l.pinyin !== a.lines[i].pinyin);
  if (diff.length === 0) continue;
  changedSongs++;
  changedLines += diff.length;
  console.log(`${row.video_id}: ${diff.length}/${a.lines.length} dòng đổi pinyin${apply ? "" : " (dry-run)"}`);
  for (const l of diff.slice(0, 3)) console.log(`  dòng ${l.index}: "${a.lines[l.index].pinyin}" → "${l.pinyin}"`);
  if (!apply) continue;
  const { error: e } = await sb.from("song_analyses").update({ analysis: { ...a, lines } })
    .eq("video_id", row.video_id).eq("learn_lang", row.learn_lang).eq("explain_lang", row.explain_lang).eq("prompt_version", row.prompt_version);
  if (e) console.log(`  → LỖI ${e.message}`);
}
console.log(`\nTổng: ${changedSongs}/${rows.length} bài, ${changedLines} dòng đổi pinyin${apply ? "" : " (dry-run, thêm --apply để ghi)"}`);
process.exit(0);
