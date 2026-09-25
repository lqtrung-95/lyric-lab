// Chạy phase 1→4 thật: lời (caption/LRCLIB) → chuẩn hóa → tách từ → tra từ điển Supabase → ứng viên. Chỉ in số liệu.
// Chạy: NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/caption-spike/analysis-pipeline-e2e-check.mts [id bài...]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { buildVocabCandidates } from "@/lib/analysis/build-vocab-candidates";
import { collectHanTerms, tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { getLyricsForVideo } from "@/lib/lyrics/get-lyrics-for-video";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";

const ids = process.argv.slice(2).map(Number);
const songs = JSON.parse(readFileSync("scripts/caption-spike/cpop-sample-songs.json", "utf8")).filter((s: { id: number }) => ids.length === 0 || ids.includes(s.id));
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
const deps = { captions: new YoutubeInnertubeCaptionProvider(), lrclib: new LrclibProvider() };

for (const song of songs) {
  const c = song.candidates[0];
  try {
    const r = await getLyricsForVideo({ videoId: c.videoId, title: c.title, channelTitle: c.channel, durationSec: c.durationSec }, deps);
    const lines = tokenizeLyricLines(normalizeLyricLines(r.lines));
    const terms = collectHanTerms(lines);
    const dict = await lookupWords(sb as never, terms);
    const cands = buildVocabCandidates(lines, dict);
    const known = terms.filter((t) => dict.has(t)).length;
    const levels: Record<string, number> = {};
    cands.forEach((x) => { const k = String(x.hskLevel ?? "-"); levels[k] = (levels[k] ?? 0) + 1; });
    console.log(`#${song.id} ${song.title}: ${r.source}, ${lines.length} dòng, ${terms.length} từ (${known} có trong từ điển), ${cands.length} ứng viên, cấp:`, JSON.stringify(levels));
  } catch (e) {
    console.log(`#${song.id} ${song.title}: lỗi ${(e as Error).message.slice(0, 80)}`);
  }
}
process.exit(0);
