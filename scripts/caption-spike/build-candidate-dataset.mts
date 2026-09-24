// Tạo cpop-sample-songs.json: mỗi bài 3 video ứng viên từ search.list. Chạy: npx tsx --env-file=.env.local scripts/caption-spike/build-candidate-dataset.mts
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { parseSongListMarkdown } from "./song-list-markdown-parser";
import { classifyVideoRole, type VideoRole } from "./classify-video-role";
import { getDurations, searchVideos } from "./youtube-data-api-client";

const SONG_LIST = "plans/260924-1827-m0-caption-spike-and-scaffold/phase-03-cpop-sample-song-list-proposal.md";
const OUT = "scripts/caption-spike/cpop-sample-songs.json";

interface Candidate { videoId: string; title: string; channel: string; role: VideoRole; durationSec: number }
interface SongEntry { id: number; title: string; artist: string; group: string; candidates: Candidate[] }

const key = process.env.YOUTUBE_DATA_API_KEY;
if (!key) throw new Error("Thiếu YOUTUBE_DATA_API_KEY (.env.local)");

const songs = parseSongListMarkdown(readFileSync(SONG_LIST, "utf8"));
const done: SongEntry[] = existsSync(OUT) ? JSON.parse(readFileSync(OUT, "utf8")) : [];
const doneIds = new Set(done.map((s) => s.id));

for (const song of songs) {
  if (doneIds.has(song.id)) continue;
  const hits = await searchVideos(`${song.artist} ${song.title}`, key);
  const durations = await getDurations(hits.map((h) => h.videoId), key);
  done.push({
    ...song,
    candidates: hits.map((h) => ({
      ...h,
      role: classifyVideoRole(h.title, h.channel, song.artist),
      durationSec: durations[h.videoId] ?? 0,
    })),
  });
  writeFileSync(OUT, JSON.stringify(done, null, 2) + "\n");
  console.log(`${song.id}/${songs.length} ${song.title}: ${hits.length} video`);
}
console.log(`Xong: ${done.length} bài, ${done.reduce((n, s) => n + s.candidates.length, 0)} video`);
