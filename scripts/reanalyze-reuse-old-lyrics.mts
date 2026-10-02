// Chạy lại pipeline phân tích LLM cho vài bài CỤ THỂ mà bước tìm lời tự động (caption/LRCLIB/Netease) giờ không
// còn khớp được nữa (vd. LRCLIB đổi cách khớp tên/độ dài), nhưng bài đã có lời đúng từ lần phân tích trước (v1/v2).
// Tái dùng nguyên lời đã lưu trong analysis cũ (vẫn đến từ LRCLIB, không phải LLM bịa — đúng quy tắc 1) thay vì
// tìm lại, rồi chạy lại đúng các bước còn lại (tách từ, tra từ điển, gọi LLM) như analyzeVideo().
//   npx tsx --env-file=.env.local scripts/reanalyze-reuse-old-lyrics.mts efKva-XmV48 UPquUdmaBFs
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { SongAnalysis } from "@/lib/analysis/analysis-types";
import { analyzeLyrics } from "@/lib/analysis/analyze-lyrics";
import { withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import { buildVocabCandidates } from "@/lib/analysis/build-vocab-candidates";
import { createDeepSeekChat } from "@/lib/analysis/deepseek-chat";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import { createChatRouter, createOpenRouterChat } from "@/lib/analysis/openrouter-chat";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";
import { tokenizeLyricLines, collectHanTerms } from "@/lib/analysis/tokenize-lyric-lines";
import { saveAnalysis } from "@/lib/analysis/song-analysis-cache";
import { createSupabaseCacheDb } from "@/lib/analysis/supabase-cache-db";
import { LEARN_LANG, EXPLAIN_LANG } from "@/lib/analysis/analyze-video";
import { PROMPT_VERSION } from "@/lib/analysis/build-analysis-prompt";

const videoIds = process.argv.slice(2);
if (videoIds.length === 0) throw new Error("Thiếu videoId. Dùng: npx tsx scripts/reanalyze-reuse-old-lyrics.mts <videoId> [videoId...]");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }, realtime: { transport: ws as never },
});
const deepseek = createDeepSeekChat(process.env.DEEPSEEK_API_KEY!);
const openrouter = process.env.OPENROUTER_API_KEY ? createOpenRouterChat(process.env.OPENROUTER_API_KEY) : undefined;
const chat = createChatRouter(createGroqChat(process.env.GROQ_API_KEY!), undefined, openrouter, deepseek);
const cache = createSupabaseCacheDb(sb as never);
const lookupDictionary = (terms: string[]) => lookupWords(sb as never, terms);

for (const videoId of videoIds) {
  const { data: song } = await sb.from("songs").select("video_id,title,channel_title,duration_sec").eq("video_id", videoId).single();
  if (!song) { console.error(`${videoId}: không có trong bảng songs`); continue; }

  const { data: oldRows } = await sb.from("song_analyses").select("lyrics_source,analysis").eq("video_id", videoId).order("created_at", { ascending: false }).limit(1);
  const old = oldRows?.[0];
  if (!old) { console.error(`${videoId}: chưa từng phân tích, không có lời cũ để tái dùng`); continue; }
  const oldAnalysis = old.analysis as SongAnalysis;

  const captionLines = oldAnalysis.lines.map((l) => ({ text: l.text, start: l.start, end: l.end }));
  const lines = tokenizeLyricLines(normalizeLyricLines(captionLines));
  const dictionary = await lookupDictionary(collectHanTerms(lines));
  const candidates = buildVocabCandidates(lines, dictionary);
  const chars = [...new Set(candidates.flatMap((c) => [...c.traditional]))];
  const { data: svRows } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
  const sinoViet = new Map((svRows ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  const pinyinDictionary = await withSubwordEntries(lookupDictionary, dictionary, lines.flatMap((l) => l.tokens.map((t) => t.simplified)));

  try {
    const { analysis } = await analyzeLyrics({
      videoId, lyricsSource: old.lyrics_source as SongAnalysis["lyricsSource"], track: oldAnalysis.track,
      lines, candidates, dictionary, pinyinDictionary, sinoViet, chat,
    });
    await saveAnalysis(cache, { videoId, learnLang: LEARN_LANG, explainLang: EXPLAIN_LANG, promptVersion: PROMPT_VERSION },
      { videoId: song.video_id, title: song.title, channelTitle: song.channel_title, durationSec: song.duration_sec }, analysis);
    console.log(`${videoId}: xong, ${analysis.items.length} mục (model ${analysis.model}, tái dùng lời nguồn ${old.lyrics_source})`);
  } catch (e) {
    console.error(`${videoId}: LỖI`, e instanceof Error ? e.message : e);
  }
}
