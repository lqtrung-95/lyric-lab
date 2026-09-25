// Chạy toàn bộ pipeline thật (lời → tách từ → từ điển → Groq → validate → ghép) cho một bài. Không in lời hay bản dịch.
// Chạy: NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/caption-spike/analysis-llm-e2e-check.mts <id bài> [model ...]
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { analyzeLyrics, DEFAULT_MODELS } from "@/lib/analysis/analyze-lyrics";
import { buildVocabCandidates } from "@/lib/analysis/build-vocab-candidates";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import { collectHanTerms, tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { getLyricsForVideo } from "@/lib/lyrics/get-lyrics-for-video";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";

const [idArg, ...models] = process.argv.slice(2);
const song = JSON.parse(readFileSync("scripts/caption-spike/cpop-sample-songs.json", "utf8")).find((s: { id: number }) => s.id === Number(idArg));
const c = song.candidates[0];
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });

const lyrics = await getLyricsForVideo(
  { videoId: c.videoId, title: c.title, channelTitle: c.channel, durationSec: c.durationSec },
  { captions: new YoutubeInnertubeCaptionProvider(), lrclib: new LrclibProvider() },
);
const lines = tokenizeLyricLines(normalizeLyricLines(lyrics.lines));
const dictionary = await lookupWords(sb as never, collectHanTerms(lines));
const candidates = buildVocabCandidates(lines, dictionary);
const chars = [...new Set(candidates.flatMap((x) => x.traditional.split("")))];
const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
const sinoViet = new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));

for (const model of models.length ? models : DEFAULT_MODELS) {
  try {
    const { analysis, attempts } = await analyzeLyrics({
      videoId: c.videoId, lyricsSource: lyrics.source, lines, candidates, dictionary, sinoViet,
      chat: createGroqChat(process.env.GROQ_API_KEY!), models: [model],
    });
    const vocab = analysis.items.filter((i) => i.type === "vocab");
    const grammar = analysis.items.filter((i) => i.type === "grammar");
    const translated = analysis.lines.filter((l) => l.translation).length;
    console.log(`\n[${model}] ${attempts[0].latencyMs}ms | từ ${vocab.length}, ngữ pháp ${grammar.length}, dịch ${translated}/${analysis.lines.length} dòng, loại ${attempts[0].dropped?.length ?? 0}:`, JSON.stringify(attempts[0].dropped?.map((d) => `${d.kind}:${d.ref}(${d.reason})`)));
    vocab.slice(0, 4).forEach((v) => console.log(`  ${v.term} ${v.reading} HSK${v.level} ${v.sinoViet ?? "-"} | ${v.meaningInContext}`));
    grammar.slice(0, 2).forEach((g) => console.log(`  NP: ${g.term} (HSK ${g.level}) dòng ${g.occurrences.map((o) => o.lineIndex)}`));
    console.log("  tóm tắt:", analysis.summary.slice(0, 120), "| mood:", analysis.moods.join(", "));
  } catch (e) {
    console.log(`\n[${model}] THẤT BẠI:`, JSON.stringify((e as { attempts?: unknown }).attempts ?? (e as Error).message).slice(0, 500));
  }
}
process.exit(0);
