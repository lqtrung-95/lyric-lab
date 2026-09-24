// Chạy spike: mỗi video ứng viên → track → tải caption → đo chất lượng. Resume được (bỏ qua video đã có trong results.jsonl).
// Chạy: YTDLP_BIN=<đường dẫn yt-dlp> npx tsx --env-file=.env.local scripts/caption-spike/run-caption-spike.mts [--limit N] [--no-oracle] [--retry-errors]
// CAPTION_SPIKE_DELAY_MS: nghỉ giữa các video (mặc định 2000). --retry-errors: xóa dòng lỗi network/blocked rồi đo lại.
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { CaptionError } from "@/lib/captions/caption-errors";
import { pickBestChineseTrack } from "@/lib/captions/pick-best-chinese-track";
import { cleanCaptionLines } from "@/lib/captions/clean-caption-lines";
import { assessLyricQuality } from "@/lib/captions/assess-lyric-quality";
import { decideUsable, type SpikeRow } from "./caption-spike-row";
import { ytDlpOracle } from "./yt-dlp-oracle";

const DATASET = "scripts/caption-spike/cpop-sample-songs.json";
const OUT_DIR = "spike-output";
const RESULTS = `${OUT_DIR}/results.jsonl`;
const DELAY_MS = Number(process.env.CAPTION_SPIKE_DELAY_MS ?? 2000);

const args = process.argv.slice(2);
const limit = args.includes("--limit") ? Number(args[args.indexOf("--limit") + 1]) : Infinity;
const useOracle = !args.includes("--no-oracle");

mkdirSync(`${OUT_DIR}/raw`, { recursive: true });
if (args.includes("--retry-errors") && existsSync(RESULTS)) {
  const kept = readFileSync(RESULTS, "utf8").split("\n").filter(Boolean)
    .filter((l) => !["network", "blocked"].includes(JSON.parse(l).errorType));
  writeFileSync(RESULTS, kept.map((l) => l + "\n").join(""));
}
const songs = JSON.parse(readFileSync(DATASET, "utf8"));
const seen = new Set<string>(
  existsSync(RESULTS) ? readFileSync(RESULTS, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l).videoId) : [],
);
const provider = new YoutubeInnertubeCaptionProvider();
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function measure(song: any, cand: any): Promise<SpikeRow> {
  const t0 = Date.now();
  const row: SpikeRow = {
    songId: song.id, videoId: cand.videoId, group: song.group, role: cand.role, durationSec: cand.durationSec,
    tracks: [], bestTrack: null, kind: null, quality: null, coverage: null, trackIsRomanized: false,
    errorType: null, latencyMs: 0, oracle: null, usable: "no",
  };
  try {
    const tracks = await provider.listTracks(cand.videoId);
    row.tracks = tracks.map((t) => `${t.lang}/${t.kind}`);
    const best = pickBestChineseTrack(tracks);
    if (!best) {
      row.errorType = "no_caption";
    } else {
      row.bestTrack = `${best.lang}/${best.kind}`;
      row.kind = best.kind;
      const raw = await provider.fetchLines(cand.videoId, best);
      const lines = cleanCaptionLines(raw);
      writeFileSync(`${OUT_DIR}/raw/${cand.videoId}.json`, JSON.stringify({ track: best.lang, lines }));
      row.quality = assessLyricQuality(lines);
      row.coverage = cand.durationSec ? row.quality.coverageSec / cand.durationSec : null;
      row.trackIsRomanized = lines.length > 0 && row.quality.hanLineRatio === 0;
    }
  } catch (e) {
    // Kiểm tra theo tên: tsx có thể nạp lớp CaptionError hai lần nên instanceof không đáng tin.
    row.errorType = (e as CaptionError).name === "CaptionError" ? (e as CaptionError).type : "network";
  }
  row.latencyMs = Date.now() - t0;
  row.usable = decideUsable(row.quality, row.coverage, row.kind);
  if (useOracle) row.oracle = await ytDlpOracle(cand.videoId);
  return row;
}

let n = 0;
for (const song of songs) {
  for (const cand of song.candidates) {
    if (seen.has(cand.videoId) || n >= limit) continue;
    const row = await measure(song, cand);
    appendFileSync(RESULTS, JSON.stringify(row) + "\n");
    n++;
    console.log(`#${song.id} ${cand.videoId} ${row.role} best=${row.bestTrack} usable=${row.usable} err=${row.errorType} ${row.latencyMs}ms`);
    await sleep(DELAY_MS);
  }
}
console.log(`Xong lượt này: ${n} video`);
process.exit(0);
