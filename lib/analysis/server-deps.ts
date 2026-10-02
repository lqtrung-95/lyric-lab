import "server-only";
import { unstable_cache } from "next/cache";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { getServerEnv } from "@/lib/env/server-env";
import { COMMON_READING, lookupWords } from "@/lib/dictionary/lookup-words";
import { LrclibProvider } from "@/lib/lyrics/lrclib-provider";
import { NeteaseProvider } from "@/lib/lyrics/netease-provider";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import { MANUAL_VARIANTS } from "@/lib/text/to-simplified-chinese";
import { EXPLAIN_LANG, LEARN_LANG, type AnalyzeStep, type AnalyzeVideoDeps } from "./analyze-video";
import { createByteplusChat } from "./byteplus-chat";
import { PROMPT_VERSION } from "./build-analysis-prompt";
import { createDeepSeekChat } from "./deepseek-chat";
import { createGroqChat } from "./groq-chat";
import { createChatRouter, createOpenRouterChat } from "./openrouter-chat";
import { buildLinePinyin, withSubwordEntries } from "./build-line-pinyin";
import { simplifyDeep } from "./simplify-analysis";
import { getCachedAnalysis } from "./song-analysis-cache";
import { createSupabaseCacheDb } from "./supabase-cache-db";
import type { SongAnalysis } from "./analysis-types";

// Danh sách model (DEFAULT_MODELS) dùng OpenRouter làm cả bước đầu lẫn bước chót, chờ 429 chậm ở bước nào cũng
// chiếm vào cùng ngân sách 60s của route — luôn chờ ngắn để kịp rớt qua model kế tiếp (hoặc báo lỗi sạch sớm hơn).
const FAST_FAIL_LIMITS = { maxRetries: 1, maxWaitSec: 8 };

/**
 * Thứ tự: DeepSeek (gọi thẳng, model chính trong DEFAULT_MODELS) → GROQ_API_KEY → FALLBACK_LLM_API_KEY (khóa Groq
 * thứ hai, cùng model) → OpenRouter. BytePlus (nếu có đủ BYTE_PLUS_API_KEY + BYTE_PLUS_MODEL_ID) không nằm trong
 * DEFAULT_MODELS của pipeline phân tích bài hát — chỉ dùng cho giải nghĩa từ/câu khi bấm (EXPLAIN_MODELS). Mỗi khóa
 * chỉ chờ ngắn khi hết hạn mức nếu còn bước sau để thử, cho kịp chuyển dự phòng trong thời gian tối đa của route.
 */
export function createChat(env: {
  GROQ_API_KEY: string; FALLBACK_LLM_API_KEY?: string; OPENROUTER_API_KEY?: string; DEEPSEEK_API_KEY?: string;
  BYTE_PLUS_API_KEY?: string; BYTE_PLUS_MODEL_ID?: string;
}) {
  const deepseek = env.DEEPSEEK_API_KEY ? createDeepSeekChat(env.DEEPSEEK_API_KEY, FAST_FAIL_LIMITS) : undefined;
  const openrouter = env.OPENROUTER_API_KEY ? createOpenRouterChat(env.OPENROUTER_API_KEY, FAST_FAIL_LIMITS) : undefined;
  const byteplus = env.BYTE_PLUS_API_KEY && env.BYTE_PLUS_MODEL_ID
    ? createByteplusChat(env.BYTE_PLUS_API_KEY, env.BYTE_PLUS_MODEL_ID, FAST_FAIL_LIMITS)
    : undefined;
  const groqFallback = env.FALLBACK_LLM_API_KEY
    ? createGroqChat(env.FALLBACK_LLM_API_KEY, fetch, undefined, openrouter ? FAST_FAIL_LIMITS : {})
    : undefined;
  const groq = createGroqChat(env.GROQ_API_KEY, fetch, undefined, groqFallback || openrouter ? FAST_FAIL_LIMITS : {});
  return createChatRouter(groq, groqFallback, openrouter, deepseek, byteplus);
}

/** Ghép mọi phụ thuộc thật (Supabase service role, Groq, YouTube, LRCLIB) cho pipeline. Chỉ dùng ở server. */
export function createAnalyzeDeps(onProgress?: (step: AnalyzeStep) => void): AnalyzeVideoDeps {
  const sb = createSupabaseServiceClient();
  const env = getServerEnv();
  return {
    captions: new YoutubeInnertubeCaptionProvider(),
    lrclib: new LrclibProvider(),
    netease: new NeteaseProvider(),
    cache: createSupabaseCacheDb(sb),
    chat: createChat(env),
    lookupDictionary: (terms) => lookupWords(sb as never, terms),
    lookupSinoViet: async (chars) => {
      const { data } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
      return new Map((data ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
    },
    onProgress,
  };
}

class NotFoundInCache extends Error {}

async function loadAnalysis(videoId: string): Promise<SongAnalysis | null> {
  const cache = createSupabaseCacheDb(createSupabaseServiceClient());
  const analysis = await getCachedAnalysis(cache, { videoId, learnLang: LEARN_LANG, explainLang: EXPLAIN_LANG, promptVersion: PROMPT_VERSION });
  return analysis ? repairLinePinyin(simplifyDeep(analysis)) : null;
}

// Phân tích của một bài gần như bất biến (khóa theo promptVersion) nên giữ trong cache của Next 1 giờ để mở lại bài không phải
// chờ Supabase. Chỉ cache kết quả CÓ: "chưa phân tích" ném lỗi để không bị cache (bài vừa phân tích xong phải hiện ngay).
// Gỡ bài theo yêu cầu (`delete from songs`) sẽ hết hiệu lực trong tối đa 1 giờ.
const analysisCache = unstable_cache(
  async (videoId: string) => {
    const analysis = await loadAnalysis(videoId);
    if (!analysis) throw new NotFoundInCache();
    return analysis;
  },
  // Số cuối tăng khi sửa dữ liệu phân tích trực tiếp trong DB (vd. bù bản dịch) để bỏ bản cache cũ ngay thay vì đợi hết 1 giờ.
  ["song-analysis", PROMPT_VERSION, "rev8"],
  { revalidate: 3600, tags: ["song-analysis"] },
);

/** Đọc phân tích đã cache (khóa theo quy tắc 8), luôn ở dạng giản thể (xem `simplifyDeep`) và có pinyin không lẫn chữ Hán. */
export async function readCachedAnalysis(videoId: string): Promise<SongAnalysis | null> {
  try {
    return await analysisCache(videoId);
  } catch (error) {
    if (error instanceof NotFoundInCache) return null;
    throw error;
  }
}

const HAN = /\p{Script=Han}/u;
// Chữ từng khiến pinyin tính sai trước khi có bản sửa: (a) khoá của COMMON_READING — từ nhiều âm từng bị chọn nhầm
// cách đọc hiếm (vd. 听 ra "yǐn" thay vì "tīng"); (b) giá trị của MANUAL_VARIANTS — chữ đích của một lượt chuẩn hoá
// giản thể bổ sung sau (vd. 著 được đổi thành 着 nên dòng vốn tra theo 著 có thể đã ra sai cách đọc). `l.text` lúc
// kiểm tra đã qua `simplifyDeep` (chạy trước hàm này) nên luôn là chữ ĐÍCH, không còn 著 gốc — so theo chữ đích đúng.
const OVERRIDE_CHARS = new Set([...Object.keys(COMMON_READING), ...Object.values(MANUAL_VARIANTS)]);
const needsPinyinRepair = (l: { text: string; pinyin: string }) => HAN.test(l.pinyin) || [...l.text].some((c) => OVERRIDE_CHARS.has(c));

/**
 * Bài đã cache có thể còn pinyin sai do: (1) lúc đó chưa có cách ghép pinyin theo đoạn con nên còn sót chữ Hán
 * trong dòng pinyin (token như 好了吗 không có nguyên từ trong từ điển), (2) chữ nhiều âm từng bị chọn nhầm cách đọc
 * hiếm trước khi thêm vào COMMON_READING, hoặc (3) chữ phồn thể từng bị bỏ sót khi chuẩn hoá giản thể (MANUAL_VARIANTS,
 * vd. 著 lẽ ra phải thành 着). Tính lại pinyin cho đúng những dòng đó từ token và từ điển, không gọi LLM — tự sửa khi
 * ai đó mở lại bài, không cần chạy script riêng.
 */
async function repairLinePinyin(analysis: SongAnalysis): Promise<SongAnalysis> {
  if (!analysis.lines.some(needsPinyinRepair)) return analysis;
  const sb = createSupabaseServiceClient();
  const lookup = (terms: string[]) => lookupWords(sb as never, terms);
  const words = analysis.lines.filter(needsPinyinRepair).flatMap((l) => l.tokens.map((t) => t.text)).filter((w) => HAN.test(w));
  const dictionary = await withSubwordEntries(lookup, await lookup(words), words);
  return {
    ...analysis,
    lines: analysis.lines.map((l) =>
      needsPinyinRepair(l) ? { ...l, pinyin: buildLinePinyin(l.tokens.map((t) => ({ text: t.text, simplified: t.text })), dictionary) } : l,
    ),
  };
}

interface SongRow { title: string; channelTitle: string; durationSec: number }

const songRowCache = unstable_cache(
  async (videoId: string): Promise<SongRow> => {
    const { data } = await createSupabaseServiceClient()
      .from("songs").select("title,channel_title,duration_sec").eq("video_id", videoId).maybeSingle();
    if (!data) throw new NotFoundInCache();
    return { title: simplifyDeep(data.title), channelTitle: simplifyDeep(data.channel_title), durationSec: data.duration_sec };
  },
  ["song-row"],
  { revalidate: 3600, tags: ["song-row"] },
);

/** Tiêu đề và kênh của bài đã lưu (để hiện ở giao diện). Cache 1 giờ như phân tích; bài chưa có thì không bị cache. */
export async function readSongRow(videoId: string): Promise<SongRow | null> {
  try {
    return await songRowCache(videoId);
  } catch (error) {
    if (error instanceof NotFoundInCache) return null;
    throw error;
  }
}
