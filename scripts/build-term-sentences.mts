// Xây lại chỉ mục từ↔câu (bảng `term_sentences`) từ các video đã duyệt. Cần migration `20261019000001_courses_and_term_sentences.sql`.
// Mặc định chỉ tính và in thống kê (dry-run), không ghi DB; thêm --apply để ghi (xóa chỉ mục cũ rồi nạp lại theo lô). Chạy lại sau mỗi đợt nạp video mới.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/build-term-sentences.mts [--per-term 5] [--apply]
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { buildTermSentences, DEFAULT_PER_TERM, type VideoLines } from "@/lib/courses/build-term-sentences";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const perTerm = Number(opt("per-term") ?? DEFAULT_PER_TERM);
const apply = args.includes("--apply");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });

// Phân trang PHẢI có order cố định: thiếu order thì các trang chồng/hụt nhau (video bị đọc hai lần, một số video bị bỏ sót).
// Cấp HSK của từ: nếu một chữ có nhiều mục từ điển (nhiều âm đọc) thì lấy cấp thấp nhất.
const levels = new Map<string, number>();
for (let from = 0; ; from += 1000) {
  const { data, error } = await sb.from("dict_words").select("simplified,hsk_level").not("hsk_level", "is", null).order("id").range(from, from + 999);
  if (error) throw error;
  if (!data?.length) break;
  for (const w of data as { simplified: string; hsk_level: number }[]) levels.set(w.simplified, Math.min(w.hsk_level, levels.get(w.simplified) ?? 99));
}

const videos: VideoLines[] = [];
for (let from = 0; ; from += 20) {
  const { data, error } = await sb.from("video_lessons").select("video_id,lines").eq("status", "listed").order("video_id").range(from, from + 19);
  if (error) throw error;
  if (!data?.length) break;
  for (const v of data as { video_id: string; lines: VideoLines["lines"] }[]) videos.push({ videoId: v.video_id, lines: v.lines });
}

const { rows, stats } = buildTermSentences(videos, levels, perTerm);
console.log(`${videos.length} video đã duyệt, ${levels.size} từ HSK, ${stats.rows} câu được giữ (tối đa ${perTerm} câu/từ)`);
for (const level of Object.keys(stats.byLevel).map(Number).sort((a, b) => a - b)) {
  const s = stats.byLevel[level];
  const pct = (n: number) => `${n} (${Math.round((100 * n) / s.words)}%)`;
  console.log(`HSK ${level}: ${s.words} từ | ≥1 câu tốt: ${pct(s.atLeast1)} | ≥3 câu tốt: ${pct(s.atLeast3)}`);
}
if (!apply) { console.log("\nDry-run: thêm --apply để ghi vào term_sentences."); process.exit(0); }

const del = await sb.from("term_sentences").delete().neq("term", "");
if (del.error) throw new Error(`xóa chỉ mục cũ: ${del.error.message} (đã chạy migration chưa?)`);
for (let i = 0; i < rows.length; i += 1000) {
  const { error } = await sb.from("term_sentences").insert(rows.slice(i, i + 1000));
  if (error) throw new Error(`ghi lô ${i}: ${error.message}`);
}
console.log(`Đã ghi ${rows.length} dòng vào term_sentences.`);
process.exit(0);
