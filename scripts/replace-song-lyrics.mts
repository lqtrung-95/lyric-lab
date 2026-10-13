// Thay lời của MỘT bài đã phân tích bằng lời chọn tay từ NetEase (khi bước tự chọn lấy nhầm bản có lời khác, ví dụ chọn theo độ dài gần nhất nhưng lời của bản đó khác video),
// áp phép đổi thời gian t' = scale * t + offset (khi bản lời có nhịp khác video), rồi chạy lại phân tích bằng chuỗi model hiện tại. Mặc định chỉ xem (dry-run):
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server scripts/replace-song-lyrics.mts <videoId> --netease=<id> [--scale=0.951] [--offset=-0.6] [--title="Tên bài"] [--artist="Ca sĩ"]
// Thêm --apply để gọi LLM và ghi đè bản phân tích trong DB. Lời vẫn lấy từ nguồn có sẵn (NetEase), không do LLM viết (quy tắc 1).
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { existsSync } from "node:fs";
import { NeteaseProvider } from "../lib/lyrics/netease-provider";
import { parseLrc } from "../lib/lyrics/parse-lrc";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const args = process.argv.slice(2);
const videoId = args.find((a) => !a.startsWith("--"));
const opt = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const neteaseId = Number(opt("netease"));
const scale = Number(opt("scale") ?? 1);
const offset = Number(opt("offset") ?? 0);
const title = opt("title");
const artist = opt("artist");
const apply = args.includes("--apply");
if (!videoId || !Number.isInteger(neteaseId)) throw new Error("Dùng: replace-song-lyrics.mts <videoId> --netease=<id> [--scale=1] [--offset=0] [--title=..] [--artist=..] [--apply]");

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const { data: song } = await sb.from("songs").select("video_id,title,channel_title,duration_sec").eq("video_id", videoId).single();
if (!song) throw new Error(`${videoId}: không có trong bảng songs`);

const item = await new NeteaseProvider().lyricsById(neteaseId);
if (!item?.syncedLyrics) throw new Error(`NetEase #${neteaseId}: không có lời có mốc thời gian`);
// Bỏ dòng tiêu đề kiểu "Ca sĩ - Tên bài (phiên bản)" ở đầu file (credit 作词/作曲 do normalizeLyricLines lọc).
const parsed = parseLrc(item.syncedLyrics).filter((l) => !(l.start < 5 && / - /.test(l.text)));
const clock = (t: number) => Math.max(0, scale * t + offset);
const lines = parsed.map((l) => ({ text: l.text, start: +clock(l.start).toFixed(2), end: +clock(l.end).toFixed(2) }));
const last = lines.at(-1)!;
console.log(`#${neteaseId} ${item.trackName} - ${item.artistName} | ${lines.length} dòng | scale=${scale} offset=${offset} | video ${song.duration_sec}s`);
for (const l of [...lines.slice(0, 5), ...lines.slice(-3)]) console.log(`  ${l.start.toFixed(1).padStart(6)}-${l.end.toFixed(1).padEnd(6)} ${l.text}`);
if (last.start > song.duration_sec) throw new Error(`Dòng cuối (${last.start}s) vượt độ dài video (${song.duration_sec}s): kiểm tra --scale/--offset`);
if (!apply) { console.log("\n(dry-run) thêm --apply để phân tích lại và ghi đè"); process.exit(0); }

const [{ analyzeLyrics }, { withSubwordEntries }, { buildVocabCandidates }, { lookupWords }, { normalizeLyricLines }, { tokenizeLyricLines, collectHanTerms }, { saveAnalysis }, { createSupabaseCacheDb }, { LEARN_LANG, EXPLAIN_LANG }, { PROMPT_VERSION }, { createChat }, { getServerEnv }] = await Promise.all([
  import("../lib/analysis/analyze-lyrics"), import("../lib/analysis/build-line-pinyin"), import("../lib/analysis/build-vocab-candidates"), import("../lib/dictionary/lookup-words"),
  import("../lib/lyrics/normalize-lyric-lines"), import("../lib/analysis/tokenize-lyric-lines"), import("../lib/analysis/song-analysis-cache"), import("../lib/analysis/supabase-cache-db"),
  import("../lib/analysis/analyze-video"), import("../lib/analysis/build-analysis-prompt"), import("../lib/analysis/server-deps"), import("../lib/env/server-env"),
]);
const lookup = (terms: string[]) => lookupWords(sb as never, terms);
const tokenized = tokenizeLyricLines(normalizeLyricLines(lines));
const dictionary = await lookup(collectHanTerms(tokenized));
const candidates = buildVocabCandidates(tokenized, dictionary);
const chars = [...new Set(candidates.flatMap((c) => [...c.traditional]))];
const { data: sv } = await sb.from("dict_hanzi_sino_viet").select("hanzi,readings").in("hanzi", chars);
const sinoViet = new Map((sv ?? []).map((r) => [r.hanzi as string, r.readings as string[]]));
const pinyinDictionary = await withSubwordEntries(lookup, dictionary, tokenized.flatMap((l) => l.tokens.map((t) => t.simplified)));
const { analysis } = await analyzeLyrics({
  videoId, lyricsSource: "netease", track: { title: title ?? item.trackName.replace(/\s*[（(].*$/, ""), artist: artist ?? item.artistName },
  lines: tokenized, candidates, dictionary, pinyinDictionary, sinoViet, chat: createChat(getServerEnv()),
});
await saveAnalysis(createSupabaseCacheDb(sb as never), { videoId, learnLang: LEARN_LANG, explainLang: EXPLAIN_LANG, promptVersion: PROMPT_VERSION },
  { videoId: song.video_id, title: song.title, channelTitle: song.channel_title, durationSec: song.duration_sec }, analysis);
console.log(`xong: ${analysis.lines.length} dòng, ${analysis.items.length} mục, model ${analysis.model}`);
process.exit(0);
