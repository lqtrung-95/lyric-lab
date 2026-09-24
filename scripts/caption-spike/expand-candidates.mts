// Mở rộng ứng viên cho các bài chưa có video dùng được: tìm thêm 10 video với từ khóa "歌词" (IN-05: gợi ý lyric video).
// Tốn 100 đơn vị Data API mỗi bài. Chạy: npx tsx --env-file=.env.local scripts/caption-spike/expand-candidates.mts
import { readFileSync, writeFileSync } from "node:fs";
import { classifyVideoRole } from "./classify-video-role";
import { getDurations, searchVideos } from "./youtube-data-api-client";

const DATASET = "scripts/caption-spike/cpop-sample-songs.json";
const RESULTS = "spike-output/results.jsonl";
const key = process.env.YOUTUBE_DATA_API_KEY;
if (!key) throw new Error("Thiếu YOUTUBE_DATA_API_KEY (.env.local)");

const songs = JSON.parse(readFileSync(DATASET, "utf8"));
const rows = readFileSync(RESULTS, "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l));
const solved = new Set(rows.filter((r) => r.usable !== "no").map((r) => r.songId));

for (const song of songs) {
  if (solved.has(song.id) || song.expanded) continue;
  const known = new Set(song.candidates.map((c: { videoId: string }) => c.videoId));
  const hits = (await searchVideos(`${song.artist} ${song.title} 歌词`, key, 10)).filter((h) => !known.has(h.videoId));
  const durations = await getDurations(hits.map((h) => h.videoId), key);
  for (const h of hits) {
    song.candidates.push({ ...h, role: classifyVideoRole(h.title, h.channel, song.artist), durationSec: durations[h.videoId] ?? 0 });
  }
  song.expanded = true;
  writeFileSync(DATASET, JSON.stringify(songs, null, 2) + "\n");
  console.log(`#${song.id} ${song.title}: +${hits.length}`);
}
console.log("Tổng ứng viên:", songs.reduce((n: number, s: { candidates: unknown[] }) => n + s.candidates.length, 0));
