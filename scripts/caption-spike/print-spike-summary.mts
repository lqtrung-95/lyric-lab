// In bảng số liệu spike từ spike-output/results.jsonl. Chạy: npx tsx scripts/caption-spike/print-spike-summary.mts
import { readFileSync } from "node:fs";
import { summarizeSpike, type Rate } from "./summarize-spike-results";

const rows = readFileSync("spike-output/results.jsonl", "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const s = summarizeSpike(rows);
const pct = (n: number, t: number) => (t ? `${Math.round((100 * n) / t)}%` : "-");
const line = (name: string, r: Rate) =>
  `| ${name} | ${r.total} | ${r.yes} (${pct(r.yes, r.total)}) | ${r.asr} | ${r.no} | ${pct(r.yes + r.asr, r.total)} |`;
const table = (title: string, data: Record<string, Rate>) =>
  [`### ${title}`, "| | Tổng | Dùng được (manual) | ASR chưa chấm | Không | Manual+ASR |", "|---|---|---|---|---|---|",
   ...Object.entries(data).map(([k, v]) => line(k, v)), ""].join("\n");

console.log(table("Tổng", { "Mức video": s.video, "Mức bài": s.song }));
console.log(table("Mức video theo vai trò", s.videoByRole));
console.log(table("Mức bài theo nhóm", s.songByGroup));
console.log("Lỗi:", s.errors, "\nTrack tiếng Trung là chữ Latin (pinyin):", s.romanizedTracks);
console.log("Hệ chữ (video ok):", s.scripts, "\nKhớp yt-dlp:", s.oracleAgreement, "\nĐộ trễ ms:", s.latencyMs);
