// Chạy getLyricsForVideo thật (caption YouTube + LRCLIB) trên video đầu tiên của mỗi bài trong dataset. Chỉ in số liệu.
// Chạy: npx tsx scripts/caption-spike/lyrics-provider-e2e-check.mts
import { readFileSync } from "node:fs";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { getLyricsForVideo } from "@/lib/lyrics/get-lyrics-for-video";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import type { NoLyricsError } from "@/lib/lyrics/lyrics-types";

const songs = JSON.parse(readFileSync("scripts/caption-spike/cpop-sample-songs.json", "utf8"));
const deps = { captions: new YoutubeInnertubeCaptionProvider(), lrclib: new LrclibProvider() };
const tally: Record<string, number> = {};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

for (const song of songs) {
  const cand = song.candidates[0];
  const video = { videoId: cand.videoId, title: cand.title, channelTitle: cand.channel, durationSec: cand.durationSec };
  let outcome: string;
  try {
    const r = await getLyricsForVideo(video, deps);
    outcome = `${r.source} (${r.lines.length} dòng, ${r.script})`;
    tally[r.source] = (tally[r.source] ?? 0) + 1;
  } catch (e) {
    // So theo tên: tsx có thể nạp lớp lỗi hai lần (alias @/ và đường dẫn tương đối) nên instanceof không đáng tin.
    if ((e as Error).name !== "NoLyricsError") throw e;
    outcome = "KHÔNG CÓ: " + (e as NoLyricsError).attempts.map((a) => `${a.source}:${a.outcome}${a.detail ? `[${a.detail.slice(0, 40)}]` : ""}`).join(" ");
    tally.none = (tally.none ?? 0) + 1;
  }
  console.log(`#${song.id} ${song.title} [${cand.role}] → ${outcome}`);
  await sleep(1500);
}
console.log("\nTổng:", tally);
process.exit(0);
