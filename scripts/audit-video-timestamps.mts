// Quét mọi video trong kho (`video_lessons`) và cho biết video nào có mốc thời gian mili giây, video nào chỉ có giây nguyên (cần thêm lại bằng dấu trang mới để câu shadowing/chép chính tả không bị cụt).
// CHỈ ĐỌC, không ghi gì vào DB. Chạy:
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/audit-video-timestamps.mts [--csv ra.csv] [--list seconds|mixed|ms|none] [--captions-only]
import { writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { classifyTimestamps, type TimestampPrecision } from "@/lib/video/timestamp-precision";

const args = process.argv.slice(2);
const csv = args.includes("--csv") ? args[args.indexOf("--csv") + 1] : null;
const list = args.includes("--list") ? (args[args.indexOf("--list") + 1] as TimestampPrecision) : "seconds";
const onlyCaptions = args.includes("--captions-only");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });

interface Row { video_id: string; title: string; channel_title: string; status: string; added_by: string | null; transcript_source: string | null; lines: { start: number; end: number }[] }
const rows: Row[] = [];
for (let from = 0; ; from += 100) {
  const { data, error } = await sb.from("video_lessons").select("video_id,title,channel_title,status,added_by,transcript_source,lines").order("created_at").range(from, from + 99);
  if (error) throw new Error(error.message);
  rows.push(...((data ?? []) as Row[]));
  if (!data || data.length < 100) break;
}

const report = rows.map((r) => ({ r, ...classifyTimestamps(r.lines ?? []) }));
const tally: Record<string, number> = {};
for (const x of report) tally[x.precision] = (tally[x.precision] ?? 0) + 1;
console.log(`Tổng ${rows.length} video:`, Object.entries(tally).map(([k, v]) => `${k}=${v}`).join("  "));
// Bảng chéo theo nguồn: phụ đề có sẵn ("captions": dán/dấu trang/SRT/Supadata) khác bản AI nghe ("auto": mốc do nhận dạng giọng nói).
const cross: Record<string, Record<string, number>> = {};
for (const x of report) { const src = x.r.transcript_source === "auto" ? "AI nghe" : x.r.added_by ? "phụ đề (người dùng thêm)" : "phụ đề (admin nạp)"; (cross[src] ??= {})[x.precision] = (cross[src][x.precision] ?? 0) + 1; }
for (const [src, t] of Object.entries(cross)) console.log(`  ${src.padEnd(28)}`, Object.entries(t).map(([k, v]) => `${k}=${v}`).join("  "));
console.log(`\nDanh sách "${list}":`);
for (const x of report.filter((y) => y.precision === list && (!onlyCaptions || y.r.transcript_source !== "auto"))) console.log(`${x.r.video_id}  ${String(x.fractionalLines).padStart(3)}/${String(x.lines).padEnd(3)}  [${x.r.status}${x.r.added_by ? ", người dùng thêm" : ", admin"}${x.r.transcript_source === "auto" ? ", AI" : ""}]  ${x.r.title.slice(0, 50)}`);
if (csv) {
  const esc = (s: string) => `"${s.replace(/"/g, '""')}"`;
  writeFileSync(csv, ["video_id,precision,fractional_lines,lines,status,added_by,transcript_source,url,title", ...report.map((x) => [x.r.video_id, x.precision, x.fractionalLines, x.lines, x.r.status, x.r.added_by ? "user" : "admin", x.r.transcript_source ?? "", `https://www.youtube.com/watch?v=${x.r.video_id}`, esc(x.r.title)].join(","))].join("\n") + "\n");
  console.log(`\nĐã ghi ${csv}`);
}
