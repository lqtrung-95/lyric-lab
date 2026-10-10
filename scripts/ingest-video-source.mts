// Đưa video của một kênh YouTube vào kho "Video luyện nghe" (bảng video_lessons), trạng thái `draft` chờ admin duyệt.
// Chỉ nhận video có phụ đề tiếng Trung do người làm (không nhận phụ đề tự động) và nhúng được. Không tải audio/video, không gọi LLM:
// chỉ lấy phụ đề tiếng Trung (KHÔNG lấy track tiếng Việt của YouTube); chia từ bằng jieba, pinyin và level từ từ điển. Video vào chưa có bản dịch: admin bấm "Dịch N dòng còn thiếu bằng AI"
// ở /admin/videos/<id>. Không in nội dung phụ đề.
// Lõi nạp dùng chung với nút "Nạp video" ở /admin/videos (lib/video/ingest-video.ts). Nên ưu tiên nút đó: chạy trên server nên không vướng
// việc YouTube chặn IP máy bạn; script này là phương án dự phòng.
// Mặc định chỉ xem (dry-run), thêm --apply để ghi DB. Video đã có bị bỏ qua (--refresh để cập nhật dòng, giữ nguyên trạng thái).
//   NODE_OPTIONS=--experimental-websocket npx tsx --env-file=.env.local scripts/ingest-video-source.mts --handle ChineseGlow [--owned] [--limit 40] [--apply]
//   ... --videos id1,id2 (chỉ định thẳng vài video thay cho cả kênh); --delay 60000 (nghỉ 60 giây giữa các video, nên dùng khi bị chặn 429)
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { YoutubeInnertubeCaptionProvider } from "@/lib/captions/youtube-innertube-caption-provider";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { isTransientCaptionError } from "@/lib/video/channel-handle";
import { ensureSource, existingVideoIds, ingestVideo, type SkipReason } from "@/lib/video/ingest-video";
import { fetchVideosMeta, listUploadVideoIds, resolveChannelByHandle } from "@/lib/video/youtube-data-api";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const apply = flag("apply");
const refresh = flag("refresh");
const limit = Number(opt("limit") ?? 40);
const DELAY_MS = Number(opt("delay") ?? 3000);
const BACKOFF_MS = [30_000, 90_000, 180_000];
const MAX_BLOCKED_IN_ROW = 2;

const key = process.env.YOUTUBE_DATA_API_KEY!;
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const deps = { sb, provider: new YoutubeInnertubeCaptionProvider(), lookup: (terms: string[]) => lookupWords(sb as never, terms) };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const SKIP_TEXT: Record<SkipReason, string> = {
  exists: "đã có", not_embeddable: "không nhúng được", no_human_zh_captions: "không có phụ đề tiếng Trung do người làm", no_lines: "không còn dòng nào sau khi làm sạch",
};

async function withBackoff<T>(label: string, fn: () => Promise<T>): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (!isTransientCaptionError(e) || attempt >= BACKOFF_MS.length) throw e;
      console.log(`${label}  YouTube đang chặn tạm, nghỉ ${BACKOFF_MS[attempt] / 1000}s rồi thử lại`);
      await sleep(BACKOFF_MS[attempt]);
    }
  }
}

// 1) Danh sách video cần xét.
let channel: { id: string; title: string } | null = null;
let ids: string[];
if (opt("videos")) {
  ids = opt("videos")!.split(",").map((s) => s.trim()).filter(Boolean);
} else {
  const handle = opt("handle");
  if (!handle) throw new Error("Cần --handle <tên kênh> hoặc --videos <id,id>");
  const c = await resolveChannelByHandle(handle, key);
  if (!c) throw new Error(`Không tìm thấy kênh @${handle}`);
  channel = { id: c.id, title: c.title };
  ids = await listUploadVideoIds(c.uploadsPlaylistId, key, limit);
}
const meta = await fetchVideosMeta(ids, key);
const have = await existingVideoIds(sb, ids).catch((e: Error) => {
  // Bảng chưa có (chưa chạy migration): chỉ chấp nhận khi xem thử, vì lúc đó chưa có video nào được lưu.
  if (apply) throw new Error(`Chưa có bảng video_lessons: chạy migration 20261006000003_video_lessons.sql trước khi --apply (${e.message})`);
  return new Set<string>();
});
const sourceId = apply && channel ? await ensureSource(sb, channel, flag("owned")) : null;

// 2) Từng video. Không ghi khi xem thử: ingestVideo ghi DB nên dry-run chỉ liệt kê, không gọi.
console.log(`${apply ? "GHI" : "XEM (dry-run)"}: ${ids.length} video${channel ? ` của ${channel.title}` : ""}\n`);
let added = 0;
let blockedInRow = 0;
for (const id of ids) {
  const m = meta.get(id);
  const label = `${id} ${m ? `${Math.round(m.durationSec / 60)}p` : "?"}`;
  if (!m) { console.log(`${label}  bỏ: không đọc được thông tin`); continue; }
  if (!apply) { console.log(`${label}  ${have.has(id) ? "đã có" : m.embeddable ? "sẽ xét khi --apply" : "không nhúng được"}`); continue; }
  try {
    const outcome = await withBackoff(label, () => ingestVideo(deps, { meta: m, sourceId, refresh }));
    blockedInRow = 0;
    if (outcome.kind === "skipped") { console.log(`${label}  bỏ: ${SKIP_TEXT[outcome.reason]}`); if (outcome.reason !== "exists" && outcome.reason !== "not_embeddable") await sleep(DELAY_MS); continue; }
    added++;
    console.log(`${label}  ${outcome.lineCount} dòng, dịch ${outcome.translatedLineCount}/${outcome.lineCount}, level ${outcome.levelAvg ?? "?"}${outcome.refreshed ? " (làm mới)" : ""}`);
  } catch (e) {
    console.log(`${label}  lỗi: ${(e as Error).message}`);
    if (isTransientCaptionError(e) && ++blockedInRow >= MAX_BLOCKED_IN_ROW) {
      console.log("\nYouTube vẫn đang chặn: dừng. Chạy lại sau ít phút (video đã nạp sẽ được bỏ qua), hoặc dùng nút Nạp video ở /admin/videos.");
      break;
    }
  }
  await sleep(DELAY_MS);
}
console.log(`\nXong.${apply ? ` Đã ghi ${added} video (trạng thái draft).` : " Thêm --apply để ghi DB."}`);
