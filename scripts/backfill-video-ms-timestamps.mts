// Lấy lại mốc thời gian MILI GIÂY cho các video đã lưu chỉ có giây nguyên (thêm bằng cách đọc bảng "Bản chép lời"): tải phụ đề do người làm (json3) bằng yt-dlp,
// căn vào các câu đã lưu theo chữ, chỉ đổi `start`/`end` (chữ, pinyin, bản dịch, từ giữ nguyên). Mặc định chỉ BÁO CÁO (dry-run); thêm --apply để ghi DB.
// Cần yt-dlp trên máy (brew install yt-dlp). Chạy:
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/backfill-video-ms-timestamps.mts [--apply] [--only id1,id2] [--limit 20]
//     [--include ms,mixed] [--min-match 0.85] [--delay 2500] [--cookies-from-browser chrome] [--report ra.csv] [--backup mốc-cũ.jsonl]
// Mặc định xử lý video phụ đề (không phải bản AI nghe) có mốc "seconds". Video AI nghe và video đã có mili giây được bỏ qua.
import { execFile } from "node:child_process";
import { appendFileSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { promisify } from "node:util";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { alignTimes, parseJson3 } from "@/lib/video/align-caption-times";
import { classifyTimestamps, type TimestampPrecision } from "@/lib/video/timestamp-precision";

const run = promisify(execFile);
const args = process.argv.slice(2);
const opt = (name: string): string | null => (args.includes(name) ? args[args.indexOf(name) + 1] ?? null : null);
const apply = args.includes("--apply");
const only = opt("--only")?.split(",").filter(Boolean) ?? null;
const limit = Number(opt("--limit") ?? 0) || Infinity;
const include = new Set<TimestampPrecision>(["seconds", ...((opt("--include")?.split(",") ?? []) as TimestampPrecision[])]);
const minMatch = Number(opt("--min-match") ?? 0.85);
const delay = Number(opt("--delay") ?? 2500);
const cookies = opt("--cookies-from-browser");
const reportPath = opt("--report");
const backupPath = opt("--backup") ?? join(tmpdir(), `video-times-backup-${Date.now()}.jsonl`);

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
interface Line { text: string; start: number; end: number; [k: string]: unknown }
interface Row { video_id: string; title: string; transcript_source: string | null; lines: Line[] }

const rows: Row[] = [];
for (let from = 0; ; from += 100) {
  const { data, error } = await sb.from("video_lessons").select("video_id,title,transcript_source,lines").order("created_at").range(from, from + 99);
  if (error) throw new Error(error.message);
  rows.push(...((data ?? []) as Row[]));
  if (!data || data.length < 100) break;
}
const todo = rows.filter((r) => r.transcript_source !== "auto" && include.has(classifyTimestamps(r.lines).precision) && (!only || only.includes(r.video_id))).slice(0, limit);
console.log(`${todo.length}/${rows.length} video cần thử${apply ? " (SẼ GHI DB)" : " (dry-run, không ghi)"}; sao lưu mốc cũ: ${apply ? backupPath : "-"}`);

/** Tải phụ đề do người làm (không lấy phụ đề tự động) và trả mọi cue của từng track tiếng Trung. */
async function fetchTracks(id: string): Promise<{ lang: string; cues: ReturnType<typeof parseJson3> }[]> {
  const dir = mkdtempSync(join(tmpdir(), "ytsub-"));
  const ytArgs = ["--skip-download", "--write-subs", "--sub-langs", "zh-Hans,zh-CN,zh-Hant,zh-TW,zh,zh-SG,zh-HK", "--sub-format", "json3", "--no-warnings", "--no-playlist", "-o", join(dir, "%(id)s"), ...(cookies ? ["--cookies-from-browser", cookies] : []), `https://www.youtube.com/watch?v=${id}`];
  await run("yt-dlp", ytArgs, { timeout: 90_000 });
  return readdirSync(dir).filter((f) => f.endsWith(".json3")).map((f) => ({ lang: f.replace(`${id}.`, "").replace(".json3", ""), cues: parseJson3(JSON.parse(readFileSync(join(dir, f), "utf8"))) }));
}

const report: string[] = ["video_id,result,lang,matched,total,ratio,changed,title"];
const tally: Record<string, number> = {};
for (const [n, r] of todo.entries()) {
  let result = "", lang = "", detail = { matched: 0, total: r.lines.length, ratio: 0, changed: 0 };
  try {
    const tracks = await fetchTracks(r.video_id);
    if (tracks.length === 0) result = "no_human_zh_track";
    else {
      const best = tracks.map((t) => ({ lang: t.lang, a: alignTimes(r.lines, t.cues) })).sort((x, y) => y.a.ratio - x.a.ratio)[0];
      lang = best.lang; detail = best.a;
      if (best.a.ratio < minMatch) result = "low_match";
      else if (best.a.changed === 0) result = "unchanged";
      else {
        result = apply ? "updated" : "would_update";
        if (apply) {
          // Sao lưu mốc cũ (mỗi video một dòng JSON) NGAY TRƯỚC khi ghi, để dừng giữa chừng vẫn khôi phục được video đã đổi.
          appendFileSync(backupPath, JSON.stringify({ video_id: r.video_id, times: r.lines.map((l) => [l.start, l.end]) }) + "\n");
          const lines = r.lines.map((l, i) => ({ ...l, start: best.a.lines[i].start, end: best.a.lines[i].end }));
          const { error } = await sb.from("video_lessons").update({ lines, updated_at: new Date().toISOString() }).eq("video_id", r.video_id);
          if (error) result = `db_error: ${error.message}`;
        }
      }
    }
  } catch (e) {
    result = `error: ${(e instanceof Error ? e.message : String(e)).split("\n").slice(-1)[0].slice(0, 80)}`;
  }
  tally[result.split(":")[0]] = (tally[result.split(":")[0]] ?? 0) + 1;
  console.log(`[${n + 1}/${todo.length}] ${r.video_id} ${result.padEnd(18)} ${lang.padEnd(8)} ${detail.matched}/${detail.total} (${Math.round(detail.ratio * 100)}%) ${r.title.slice(0, 45)}`);
  report.push([r.video_id, JSON.stringify(result), lang, detail.matched, detail.total, detail.ratio.toFixed(2), detail.changed, JSON.stringify(r.title)].join(","));
  if (n < todo.length - 1) await new Promise((res) => setTimeout(res, delay));
}
console.log("\nTổng kết:", Object.entries(tally).map(([k, v]) => `${k}=${v}`).join("  "));
if (apply) console.log(`Sao lưu mốc cũ (mỗi video một dòng JSON): ${backupPath}`);
if (reportPath) { writeFileSync(reportPath, report.join("\n") + "\n"); console.log(`Đã ghi báo cáo ${reportPath}`); }
