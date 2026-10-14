// Gán thẻ chủ đề (hoạt hình, vlog, đời sống, du lịch, hài, thiếu nhi, phim ngắn, podcast) cho các video CHƯA có thẻ: AI đọc tên video, tên kênh và vài câu đầu, lỗi thì dùng quy tắc từ khóa.
// Cần migration `20261014000004_video_tags.sql` đã chạy. Mặc định chỉ in kết quả (dry-run); thêm --apply để ghi DB; --all để gán lại cả video đã có thẻ.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/backfill-video-tags.mts [--apply] [--all] [--delay 2000]
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { createChat } from "@/lib/analysis/server-deps";
import { getServerEnv } from "@/lib/env/server-env";
import { classifyVideoTags } from "@/lib/video/classify-video-tags";
import { normalizeTags, tagLabel } from "@/lib/video/video-tags";

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const all = args.includes("--all");
const delay = Number(args[args.indexOf("--delay") + 1] || 2000);
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChat(getServerEnv());

const { data, error } = await sb.from("video_lessons").select("video_id,title,channel_title,tags,lines").order("created_at", { ascending: false });
if (error) throw new Error(/tags/i.test(error.message) ? "Cột tags chưa có: chạy migration 20261014000004_video_tags.sql trước." : error.message);
const rows = (data ?? []) as { video_id: string; title: string; channel_title: string; tags: unknown; lines: { text: string }[] }[];
const todo = rows.filter((r) => all || normalizeTags(r.tags).length === 0);
console.log(`${todo.length}/${rows.length} video cần gán thẻ${apply ? "" : " (dry-run)"}`);
const tally: Record<string, number> = {};
for (const r of todo) {
  const tags = await classifyVideoTags(chat, { title: r.title, channelTitle: r.channel_title, lines: r.lines.map((l) => l.text) });
  tags.forEach((t) => { tally[tagLabel(t)] = (tally[tagLabel(t)] ?? 0) + 1; });
  console.log(r.video_id, tags.map(tagLabel).join(", ") || "(không có)", "|", r.title.slice(0, 40));
  if (apply && tags.length > 0) {
    const { error: updateError } = await sb.from("video_lessons").update({ tags }).eq("video_id", r.video_id);
    if (updateError) console.log("  LỖI ghi:", updateError.message);
  }
  await new Promise((res) => setTimeout(res, delay));
}
console.log("Tổng theo thẻ:", JSON.stringify(tally));
process.exit(0);
