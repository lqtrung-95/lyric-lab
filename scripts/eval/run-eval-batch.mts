// Chạy pipeline thật cho các bài trong dataset và xuất phiếu chấm eval-output/eval-sheet.csv (không cần bảng cache trên DB).
// Chạy: NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/eval/run-eval-batch.mts [id bài ...]
// Không có id → chạy cả 50 bài. Kết quả từng bài lưu ở eval-output/analyses/<id>.json (đã gitignore: chứa lời bài hát).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { analyzeVideo } from "@/lib/analysis/analyze-video";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import type { CacheDb } from "@/lib/analysis/song-analysis-cache";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";

// Nghỉ giữa các bài để không vượt hạn mức token/phút của Groq (gói miễn phí 8.000).
const PACE_MS = Number(process.env.EVAL_PACE_MS ?? 30_000);
const ids = process.argv.slice(2).map(Number);
const songs = JSON.parse(readFileSync("scripts/caption-spike/cpop-sample-songs.json", "utf8")).filter((s: { id: number }) => ids.length === 0 || ids.includes(s.id));
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
mkdirSync("eval-output/analyses", { recursive: true });

// Cache dạng file thay cho DB, để chạy eval không phụ thuộc migration.
let currentSongId = 0;
const fileCache: CacheDb = {
  selectAnalysis: async () => {
    const p = `eval-output/analyses/${currentSongId}.json`;
    return { data: existsSync(p) ? [{ analysis: JSON.parse(readFileSync(p, "utf8")) as SongAnalysis }] : [], error: null };
  },
  upsertSong: async () => ({ data: null, error: null }),
  upsertAnalysis: async (r) => { writeFileSync(`eval-output/analyses/${currentSongId}.json`, JSON.stringify(r.analysis, null, 1)); return { data: null, error: null }; },
};

const chat = createGroqChat(process.env.GROQ_API_KEY!);
const esc = (s: string | number | undefined | null) => `"${String(s ?? "").replace(/"/g, '""')}"`;
const sheet = [["songId", "song", "itemId", "type", "term", "reading", "hsk", "sinoViet", "meaningInContext", "lineText", "verdict", "note"].join(",")];

for (const song of songs) {
  currentSongId = song.id;
  const c = song.candidates[0];
  try {
    const { analysis, fromCache, attempts } = await analyzeVideo(
      { videoId: c.videoId, title: c.title, channelTitle: c.channel, durationSec: c.durationSec },
      {
        captions: new YoutubeInnertubeCaptionProvider(), lrclib: new LrclibProvider(), cache: fileCache, chat,
        lookupDictionary: (terms) => lookupWords(sb as never, terms),
        lookupSinoViet: async (chars) => {
          const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
          return new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
        },
      },
    );
    for (const it of analysis.items) {
      const line = analysis.lines.find((l) => l.index === it.occurrences[0]?.lineIndex);
      sheet.push([song.id, song.title, it.id, it.type, it.term, it.reading, it.level, it.sinoViet, it.meaningInContext, line?.text, "", ""].map(esc).join(","));
    }
    if (!fromCache) await new Promise((r) => setTimeout(r, PACE_MS));
    console.log(`#${song.id} ${song.title}: ${fromCache ? "cache" : analysis.model} | ${analysis.items.length} mục | ${attempts.map((a) => `${a.model}:${a.latencyMs}ms`).join(" ")}`);
  } catch (e) {
    const attempts = (e as { attempts?: { model: string; error?: string }[] }).attempts;
    console.log(`#${song.id} ${song.title}: BỎ QUA (${(e as Error).name}: ${(e as Error).message.slice(0, 80)})`, attempts ? JSON.stringify(attempts.map((a) => `${a.model}: ${a.error?.slice(0, 120)}`)) : "");
  }
}
writeFileSync("eval-output/eval-sheet.csv", "﻿" + sheet.join("\n") + "\n");
console.log(`Đã ghi eval-output/eval-sheet.csv (${sheet.length - 1} mục)`);
process.exit(0);
