// Đưa video của một kênh YouTube vào kho "Video luyện nghe" (bảng video_lessons), trạng thái `draft` chờ admin duyệt.
// Chỉ nhận video có phụ đề tiếng Trung do người làm (không nhận phụ đề tự động) và nhúng được. Không tải audio/video, không gọi LLM:
// bản dịch lấy từ track tiếng Việt do người làm; chia từ bằng jieba, pinyin và level từ từ điển. Không in nội dung phụ đề.
// Mặc định chỉ xem (dry-run), thêm --apply để ghi DB. Video đã có trong DB bị bỏ qua (--refresh để cập nhật dòng, giữ nguyên trạng thái).
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-video-source.mts --handle ChineseGlow [--owned] [--limit 40] [--apply]
//   ... --videos id1,id2 (chỉ định thẳng vài video thay cho cả kênh)
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { withSubwordEntries } from "@/lib/analysis/build-line-pinyin";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { pickBestChineseTrack } from "@/lib/captions/pick-best-chinese-track";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { averageLessonLevel, prepareLessonLines, termsToLookUp, toLessonLines } from "@/lib/video/build-lesson-lines";
import { parseIsoDuration } from "@/lib/youtube/parse-iso-duration";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const apply = flag("apply");
const refresh = flag("refresh");
const limit = Number(opt("limit") ?? 40);
const DELAY_MS = 900;

const key = process.env.YOUTUBE_DATA_API_KEY!;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const provider = new YoutubeInnertubeCaptionProvider();
const lookup = (terms: string[]) => lookupWords(sb as never, terms);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function yt(path: string, q: Record<string, string>) {
  const u = new URL(`https://www.googleapis.com/youtube/v3/${path}`);
  Object.entries({ ...q, key }).forEach(([k, v]) => u.searchParams.set(k, v));
  const res = await fetch(u, { signal: AbortSignal.timeout(15_000) });
  const json = await res.json();
  if (!res.ok) throw new Error(`YouTube Data API ${path} ${res.status}: ${json.error?.message}`);
  return json;
}

// 1) Danh sách video cần xét.
let channel: { id: string; title: string } | null = null;
let ids: string[];
if (opt("videos")) {
  ids = opt("videos")!.split(",").map((s) => s.trim()).filter(Boolean);
} else {
  const handle = opt("handle");
  if (!handle) throw new Error("Cần --handle <tên kênh> hoặc --videos <id,id>");
  const c = (await yt("channels", { part: "contentDetails,snippet", forHandle: handle })).items?.[0];
  if (!c) throw new Error(`Không tìm thấy kênh @${handle}`);
  channel = { id: c.id, title: c.snippet.title };
  ids = [];
  let token: string | undefined;
  do {
    const page = await yt("playlistItems", { part: "contentDetails", playlistId: c.contentDetails.relatedPlaylists.uploads, maxResults: "50", ...(token ? { pageToken: token } : {}) });
    ids.push(...page.items.map((i: { contentDetails: { videoId: string } }) => i.contentDetails.videoId));
    token = page.nextPageToken;
  } while (token && ids.length < limit);
  ids = ids.slice(0, limit);
}

const meta = new Map<string, { title: string; channelTitle: string; durationSec: number; embeddable: boolean; channelId: string }>();
for (let i = 0; i < ids.length; i += 50) {
  const v = await yt("videos", { part: "snippet,contentDetails,status", id: ids.slice(i, i + 50).join(",") });
  for (const x of v.items) meta.set(x.id, { title: x.snippet.title, channelTitle: x.snippet.channelTitle, durationSec: parseIsoDuration(x.contentDetails.duration), embeddable: x.status.embeddable, channelId: x.snippet.channelId });
}

const { data: existing, error: existingError } = await sb.from("video_lessons").select("video_id").in("video_id", ids);
// Bảng chưa có (chưa chạy migration): chỉ chấp nhận khi xem thử, vì lúc đó chưa có video nào được lưu.
if (existingError && !(existingError.code === "42P01" || existingError.code === "PGRST205") ) throw new Error(`Đọc video_lessons lỗi: ${existingError.message}`);
if (existingError && apply) throw new Error("Chưa có bảng video_lessons: chạy migration 20261006000003_video_lessons.sql trước khi --apply");
const have = new Set((existing ?? []).map((r) => r.video_id as string));

// 2) Nguồn (chỉ khi ghi thật).
let sourceId: string | null = null;
if (apply && channel) {
  const { data, error } = await sb.from("video_sources").upsert({ youtube_ref: channel.id, title: channel.title, owned: flag("owned"), human_zh_captions: true }, { onConflict: "youtube_ref" }).select("id").single();
  if (error) throw new Error(`Ghi video_sources lỗi: ${error.message}`);
  sourceId = data.id as string;
}

// 3) Từng video.
console.log(`${apply ? "GHI" : "XEM (dry-run)"}: ${ids.length} video${channel ? ` của ${channel.title}` : ""}\n`);
let added = 0;
for (const id of ids) {
  const m = meta.get(id);
  const label = `${id} ${m ? `${Math.round(m.durationSec / 60)}p` : "?"}`;
  if (!m) { console.log(`${label}  bỏ: không đọc được thông tin`); continue; }
  if (!m.embeddable) { console.log(`${label}  bỏ: không nhúng được`); continue; }
  if (have.has(id) && !refresh) { console.log(`${label}  bỏ: đã có`); continue; }
  try {
    const tracks = await provider.listTracks(id);
    const zhTrack = pickBestChineseTrack(tracks);
    if (!zhTrack || zhTrack.kind !== "manual") { console.log(`${label}  bỏ: không có phụ đề tiếng Trung do người làm`); await sleep(DELAY_MS); continue; }
    const viTrack = tracks.find((t) => t.lang.toLowerCase().startsWith("vi") && t.kind === "manual") ?? null;
    const [zh, vi] = [await provider.fetchLines(id, zhTrack), viTrack ? await provider.fetchLines(id, viTrack) : null];
    const prepared = prepareLessonLines(zh, vi);
    if (prepared.length === 0) { console.log(`${label}  bỏ: không còn dòng nào sau khi làm sạch`); continue; }
    const terms = termsToLookUp(prepared);
    const dictionary = await withSubwordEntries(lookup, await lookup(terms), terms);
    const lines = toLessonLines(prepared, dictionary);
    const translated = lines.filter((l) => l.translation).length;
    const level = averageLessonLevel(prepared, dictionary);
    console.log(`${label}  ${zhTrack.lang}${vi ? "+vi" : ""}  ${lines.length} dòng, dịch ${translated}/${lines.length}, level ${level ?? "?"}${have.has(id) ? " (làm mới)" : ""}`);
    if (apply) {
      const row = {
        video_id: id, source_id: sourceId, title: m.title, channel_title: m.channelTitle, duration_sec: m.durationSec, level_avg: level,
        translation_source: vi ? "youtube" : "none", line_count: lines.length, translated_line_count: translated, lines, updated_at: new Date().toISOString(),
      };
      const { error } = have.has(id)
        ? await sb.from("video_lessons").update(row).eq("video_id", id)
        : await sb.from("video_lessons").insert({ ...row, status: "draft" });
      if (error) throw new Error(`Ghi video_lessons lỗi: ${error.message}`);
      added++;
    }
  } catch (e) {
    console.log(`${label}  lỗi: ${(e as Error).message}`);
  }
  await sleep(DELAY_MS);
}
console.log(`\nXong.${apply ? ` Đã ghi ${added} video (trạng thái draft).` : " Thêm --apply để ghi DB."}`);
