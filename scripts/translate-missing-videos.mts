// Dịch bù bản dịch tiếng Việt cho mọi video còn dòng trống (video thêm lúc ngân sách AI trong ngày đã hết). Mặc định chỉ liệt kê (dry-run):
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server scripts/translate-missing-videos.mts
// Thêm --apply để dịch và ghi vào DB (tuần tự từng video, dùng chuỗi Gemini → Groq → DeepSeek → OpenRouter như nút "Dịch N dòng còn thiếu" ở /admin/videos/<id>).
// Chạy lại được nhiều lần: video nào vẫn còn dòng trống (quá thời gian, hết hạn mức) sẽ được dịch tiếp ở lần sau.
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { existsSync } from "node:fs";

if (existsSync(".env.local")) process.loadEnvFile(".env.local");
// Gemini gói miễn phí giới hạn số request mỗi phút: cách nhau tối thiểu từng này giữa hai lần gọi AI (6000ms ≈ 10 request/phút), dịch tuần tự.
const MIN_INTERVAL_MS = Number(process.env.MIN_INTERVAL_MS ?? 6000);
const apply = process.argv.includes("--apply");
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const { data, error } = await sb.from("video_lessons").select("video_id,title,line_count,translated_line_count").order("created_at", { ascending: false });
if (error) throw new Error(error.message);
const todo = (data ?? []).filter((r) => r.translated_line_count < r.line_count);
console.log(`${todo.length} video còn dòng chưa dịch, tổng ${todo.reduce((s, r) => s + r.line_count - r.translated_line_count, 0)} dòng${apply ? "" : " (dry-run)"}`);
if (apply) {
  const { translateMissingLessonLines } = await import("../lib/video/admin-translate-missing");
  let last = 0;
  let chain: Promise<unknown> = Promise.resolve();
  const chatWrap = (chat: (req: never) => Promise<string>) => (req: never) => {
    const run = chain.then(async () => {
      const wait = last + MIN_INTERVAL_MS - Date.now();
      if (wait > 0) await new Promise((res) => setTimeout(res, wait));
      last = Date.now();
      return chat(req);
    });
    chain = run.catch(() => undefined);
    return run;
  };
  for (const r of todo) {
    try {
      const res = await translateMissingLessonLines(r.video_id, { concurrency: 1, timeBudgetMs: 10 * 60_000, chatWrap: chatWrap as never });
      console.log(r.video_id, typeof res === "string" ? res : `dịch ${res.translated}, còn ${res.remaining}`, (r.title ?? "").slice(0, 30));
    } catch (e) {
      console.log(r.video_id, "LỖI", (e as Error).message);
    }
  }
}
process.exit(0);
