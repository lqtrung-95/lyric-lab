// Nạp video của kênh mình từ file phụ đề (.srt) do công cụ làm podcast xuất ra, thay cho việc tải phụ đề từ YouTube (bị chặn IP).
// Mỗi tập có <tên>.zh.srt + <tên>.vi.srt (cùng mốc thời gian với video đã đăng); tiêu đề lấy từ <tên>_script.json (nếu có) để ghép với video trên kênh,
// không ghép được thì ghép theo thời lượng. Chỉ đọc file .srt và _script.json, KHÔNG đọc .env hay client_secret.json trong thư mục đó.
// Dùng Data API cho thông tin video; không tải audio/video. Mặc định chỉ xem (dry-run); --apply để ghi DB (trạng thái draft); --refresh để làm mới video đã có.
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-from-podcast-output.mts --dir "/đường/dẫn/podcast_tool/output" [--handle ChineseGlow] [--apply] [--refresh]
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import type { CaptionProvider } from "@/lib/captions/caption-provider-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { ensureSource, existingVideoIds, ingestVideo } from "@/lib/video/ingest-video";
import { matchEpisodes, type PodcastEpisode } from "@/lib/video/match-podcast-files";
import { parseSrt } from "@/lib/video/parse-srt";
import { fetchVideosMeta, listUploadVideoIds, resolveChannelByHandle } from "@/lib/video/youtube-data-api";

const args = process.argv.slice(2);
const flag = (n: string) => args.includes(`--${n}`);
const opt = (n: string) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const dir = opt("dir");
if (!dir) throw new Error('Cần --dir "<thư mục output của công cụ podcast>"');
const apply = flag("apply");
const handle = opt("handle") ?? "ChineseGlow";
const key = process.env.YOUTUBE_DATA_API_KEY!;

// 1) Đọc các tập: chỉ file .zh.srt có .vi.srt đi kèm.
const files = await readdir(dir);
const episodes: PodcastEpisode[] = [];
for (const f of files.filter((n) => n.endsWith(".zh.srt")).sort()) {
  const base = f.slice(0, -".zh.srt".length);
  if (!files.includes(`${base}.vi.srt`)) { console.log(`bỏ ${base}: thiếu .vi.srt`); continue; }
  const lines = parseSrt(await readFile(path.join(dir, f), "utf8"));
  if (lines.length === 0) { console.log(`bỏ ${base}: .zh.srt rỗng`); continue; }
  let titleZh: string | undefined;
  let titleEn: string | undefined;
  if (files.includes(`${base}_script.json`)) {
    try {
      const s = JSON.parse(await readFile(path.join(dir, `${base}_script.json`), "utf8")) as { title_zh?: string; title_en?: string };
      titleZh = s.title_zh; titleEn = s.title_en;
    } catch { /* không có tiêu đề thì ghép theo thời lượng */ }
  }
  episodes.push({ base, titleZh, titleEn, lastEndSec: Math.max(...lines.map((l) => l.end)) });
}

// 2) Video dài trên kênh (bỏ Shorts) rồi ghép.
const channel = await resolveChannelByHandle(handle, key);
if (!channel) throw new Error(`Không tìm thấy kênh @${handle}`);
const ids = await listUploadVideoIds(channel.uploadsPlaylistId, key, 100);
const meta = [...(await fetchVideosMeta(ids, key)).values()].filter((v) => v.durationSec > 150);
const { matches, unmatched } = matchEpisodes(episodes, meta);

console.log(`${apply ? "GHI" : "XEM (dry-run)"}: ${episodes.length} tập, ${meta.length} video dài trên @${handle}\n`);
for (const m of matches) console.log(`${m.video.videoId}  ← ${m.episode.base}  (ghép theo ${m.by === "title" ? "tiêu đề" : "thời lượng"}; video ${m.video.durationSec}s, phụ đề tới ${Math.round(m.episode.lastEndSec)}s)`);
for (const e of unmatched) console.log(`(chưa ghép) ${e.base}`);
if (!apply) { console.log("\nThêm --apply để ghi DB."); process.exit(0); }

// 3) Ghi: provider giả đọc SRT thay vì tải từ YouTube.
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const byVideo = new Map(matches.map((m) => [m.video.videoId, m.episode.base]));
const provider: CaptionProvider = {
  async listTracks() { return [{ lang: "zh-Hans", kind: "manual" }, { lang: "vi", kind: "manual" }] as never; },
  async fetchLines(videoId, track) {
    const base = byVideo.get(videoId)!;
    return parseSrt(await readFile(path.join(dir, `${base}.${track.lang.startsWith("vi") ? "vi" : "zh"}.srt`), "utf8"));
  },
};
const deps = { sb, provider, lookup: (terms: string[]) => lookupWords(sb as never, terms) };
const sourceId = await ensureSource(sb, { id: channel.id, title: channel.title }, true);
await existingVideoIds(sb, [...byVideo.keys()]);
for (const m of matches) {
  const outcome = await ingestVideo(deps, { meta: m.video, sourceId, refresh: flag("refresh") });
  console.log(outcome.kind === "ingested"
    ? `${m.video.videoId}  ${outcome.lineCount} dòng, dịch ${outcome.translatedLineCount}/${outcome.lineCount}, level ${outcome.levelAvg ?? "?"}${outcome.refreshed ? " (làm mới)" : ""}`
    : `${m.video.videoId}  bỏ: ${outcome.reason}`);
}
console.log("\nXong (trạng thái draft, duyệt ở /admin/videos).");
