// Chạy lại pipeline phân tích LLM cho các bài đã cache nhưng ở PROMPT_VERSION cũ (vd. nâng số từ vựng/ngữ pháp từ 12–16
// lên 20–25) — dùng lại đúng analyzeVideo() nên tốn 1 lượt gọi LLM + quét lại lời (caption/LRCLIB) mỗi bài, giống hệt
// lúc người dùng thật mở bài. Mặc định chỉ xem (dry-run), không gọi LLM.
//   npx tsx --env-file=.env.local scripts/reanalyze-songs.mts
//   npx tsx --env-file=.env.local scripts/reanalyze-songs.mts --apply --limit=5
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { analyzeVideo } from "@/lib/analysis/analyze-video";
import { PROMPT_VERSION } from "@/lib/analysis/build-analysis-prompt";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { createDeepSeekChat } from "@/lib/analysis/deepseek-chat";
import { createGroqChat } from "@/lib/analysis/groq-chat";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { NeteaseProvider } from "@/lib/lyrics/netease-provider";
import { createChatRouter, createOpenRouterChat } from "@/lib/analysis/openrouter-chat";
import { createSupabaseCacheDb } from "@/lib/analysis/supabase-cache-db";
import type { VideoMeta } from "@/lib/lyrics/lyrics-types";

const apply = process.argv.includes("--apply");
const limitArg = process.argv.find((a) => a.startsWith("--limit="));
const limit = limitArg ? Number(limitArg.slice("--limit=".length)) : Infinity;

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
  auth: { persistSession: false }, realtime: { transport: ws as never },
});

const groqFallback = process.env.FALLBACK_LLM_API_KEY ? createGroqChat(process.env.FALLBACK_LLM_API_KEY) : undefined;
const openrouter = process.env.OPENROUTER_API_KEY ? createOpenRouterChat(process.env.OPENROUTER_API_KEY) : undefined;
const deepseek = process.env.DEEPSEEK_API_KEY ? createDeepSeekChat(process.env.DEEPSEEK_API_KEY) : undefined;

const deps = {
  captions: new YoutubeInnertubeCaptionProvider(),
  lrclib: new LrclibProvider(),
  netease: new NeteaseProvider(),
  cache: createSupabaseCacheDb(sb as never),
  // Dùng DEFAULT_MODELS (deepseek trước, gọi thẳng API — nhanh/ổn định hơn hẳn deepseek qua OpenRouter, xem lịch sử).
  chat: createChatRouter(createGroqChat(process.env.GROQ_API_KEY!), groqFallback, openrouter, deepseek),
  lookupDictionary: (terms: string[]) => lookupWords(sb as never, terms),
  lookupSinoViet: async (chars: string[]) => {
    const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
    return new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
  },
};

const { data: analyses, error: analysesError } = await sb.from("song_analyses").select("video_id,prompt_version");
if (analysesError) throw new Error(analysesError.message);

const versionsByVideo = new Map<string, Set<string>>();
for (const row of analyses ?? []) {
  const set = versionsByVideo.get(row.video_id) ?? new Set<string>();
  set.add(row.prompt_version);
  versionsByVideo.set(row.video_id, set);
}
const staleVideoIds = [...versionsByVideo.keys()].filter((id) => !versionsByVideo.get(id)!.has(PROMPT_VERSION)).slice(0, limit);

if (staleVideoIds.length === 0) {
  console.log(`Không có bài nào cần chạy lại (đã ở PROMPT_VERSION ${PROMPT_VERSION}).`);
  process.exit(0);
}

const { data: songs, error: songsError } = await sb.from("songs").select("video_id,title,channel_title,duration_sec").in("video_id", staleVideoIds);
if (songsError) throw new Error(songsError.message);

console.log(`${staleVideoIds.length} bài cần chạy lại lên PROMPT_VERSION ${PROMPT_VERSION}${apply ? "" : " (--dry-run, chưa gọi LLM)"}:`);

let done = 0;
let failed = 0;
for (const song of songs ?? []) {
  if (!apply) {
    console.log(`  ${song.video_id}: ${song.title}`);
    continue;
  }
  const video: VideoMeta = { videoId: song.video_id, title: song.title, channelTitle: song.channel_title, durationSec: song.duration_sec };
  try {
    const { analysis } = await analyzeVideo(video, deps);
    console.log(`  ${song.video_id}: xong, ${analysis.items.length} mục (model ${analysis.model})`);
    done++;
  } catch (e) {
    console.error(`  ${song.video_id}: LỖI ${e instanceof Error ? e.message : String(e)}`);
    failed++;
  }
  // Chờ giữa các bài để không dồn YouTube/LLM cùng lúc (không có trần 60s của route /api/analyze ở đây).
  await new Promise((r) => setTimeout(r, 1500));
}

if (apply) console.log(`Xong: ${done}/${staleVideoIds.length}, lỗi ${failed}.`);
