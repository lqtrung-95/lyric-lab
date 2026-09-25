// Đo độ phủ LRCLIB (kho lời đồng bộ mở) cho 50 bài. Chỉ ghi số liệu, KHÔNG lưu và KHÔNG in lời.
// Chạy: npx tsx scripts/caption-spike/lrclib-coverage-spike.mts
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { parseLrc } from "@/lib/lyrics/parse-lrc";
import { assessLyricQuality } from "@/lib/captions/assess-lyric-quality";

interface LrclibItem { trackName: string; artistName: string; duration: number; instrumental: boolean; syncedLyrics: string | null }

const songs = JSON.parse(readFileSync("scripts/caption-spike/cpop-sample-songs.json", "utf8"));
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const rows: Record<string, unknown>[] = [];

for (const song of songs) {
  let items: LrclibItem[] = [];
  try {
    const url = `https://lrclib.net/api/search?q=${encodeURIComponent(`${song.title} ${song.artist}`)}`;
    const res = await fetch(url, { headers: { "User-Agent": "lyric-lab-spike (personal project)" }, signal: AbortSignal.timeout(20_000) });
    items = res.ok ? await res.json() : [];
  } catch { /* lỗi mạng: tính là không có kết quả */ }

  const synced = items.filter((i) => i.syncedLyrics && !i.instrumental);
  const titleHit = synced.filter((i) => i.trackName.includes(song.title));
  const strict = titleHit.filter((i) => i.artistName.includes(song.artist) || song.artist.includes(i.artistName));
  const best = strict[0] ?? titleHit[0] ?? null;

  let quality = null, lineCount = 0, durationGapSec: number | null = null;
  if (best) {
    const lines = parseLrc(best.syncedLyrics!);
    lineCount = lines.length;
    quality = assessLyricQuality(lines);
    const gaps = song.candidates.filter((c: { durationSec: number }) => c.durationSec).map((c: { durationSec: number }) => Math.abs(c.durationSec - best.duration));
    durationGapSec = gaps.length ? Math.min(...gaps) : null;
  }
  rows.push({
    songId: song.id, group: song.group, results: items.length, synced: synced.length,
    titleMatch: titleHit.length > 0, strictMatch: strict.length > 0,
    lineCount, hanLineRatio: quality?.hanLineRatio ?? null, verdict: quality?.verdict ?? null,
    script: quality?.script ?? null, durationGapSec,
  });
  console.log(`#${song.id} ${song.title}: synced=${synced.length} title=${titleHit.length} strict=${strict.length} verdict=${quality?.verdict ?? "-"} gap=${durationGapSec?.toFixed(0) ?? "-"}s`);
  await sleep(1000);
}
mkdirSync("spike-output", { recursive: true });
writeFileSync("spike-output/lrclib-results.json", JSON.stringify(rows, null, 2));

const n = rows.length;
const cnt = (f: (r: any) => boolean) => rows.filter(f).length;
console.log("\n--- Tổng hợp ---");
console.log(`Có lời đồng bộ khớp tên bài: ${cnt((r) => r.titleMatch)}/${n}; khớp cả nghệ sĩ: ${cnt((r) => r.strictMatch)}/${n}`);
console.log(`Chữ Hán đạt (verdict ok): ${cnt((r) => r.verdict === "ok")}/${n}`);
console.log(`Độ dài lệch ≤ 10s so với ít nhất một video ứng viên: ${cnt((r) => r.durationGapSec !== null && r.durationGapSec <= 10)}/${n}`);
const byGroup: Record<string, { t: number; ok: number }> = {};
rows.forEach((r: any) => { const g = (byGroup[r.group] ??= { t: 0, ok: 0 }); g.t++; if (r.verdict === "ok") g.ok++; });
console.log("Theo nhóm:", byGroup);
