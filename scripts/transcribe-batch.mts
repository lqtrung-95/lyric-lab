// Nạp THEO ĐỢT nhiều video không có phụ đề bằng AI nghe (scripts/transcribe-video.mts) từ một danh sách mã video, để không làm cạn hạn mức Gemini miễn phí trong ngày
// (đo 2026-10-14/15: nạp hơn 100 video một lượt làm cả 50 khóa trả 429 cho yêu cầu nghe video, hạn mức reset khoảng 14-15 giờ Việt Nam).
// Mỗi lần chạy: bỏ qua video đã có trong kho, thử một yêu cầu video nhỏ để biết còn hạn mức không (hết thì dừng ngay), nạp tối đa --limit video (mặc định 40),
// dừng sớm nếu 3 video liên tiếp lỗi. Chạy lại ngày hôm sau để nạp tiếp phần còn lại. Mặc định chỉ liệt kê (dry-run); thêm --apply để nạp thật.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/transcribe-batch.mts --file tmp/daddyloong-keep.txt [--limit 40] [--status listed|draft] [--apply]
// File danh sách: mã video cách nhau bằng khoảng trắng hoặc xuống dòng.
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import ws from "ws";
import { existingVideoIds } from "@/lib/video/ingest-video";
import { parseGeminiKeys } from "@/lib/analysis/gemini-chat";
import { ASR_BATCH_MODELS } from "@/lib/video/asr/transcribe-chunk-gemini";

const args = process.argv.slice(2);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const file = opt("file");
if (!file) throw new Error("Cần --file <đường dẫn danh sách mã video>");
const limit = Number(opt("limit") ?? 40);
const status = opt("status") === "draft" ? "draft" : "listed";
const apply = args.includes("--apply");
const MAX_CONSECUTIVE_FAILS = 3;

const all = [...new Set(readFileSync(file, "utf8").split(/\s+/).filter((s) => /^[A-Za-z0-9_-]{11}$/.test(s)))];
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const have = await existingVideoIds(sb, all);
const pending = all.filter((id) => !have.has(id));
console.log(`Danh sách ${all.length} video: đã có ${have.size}, còn ${pending.length}. Đợt này nạp tối đa ${Math.min(limit, pending.length)}.${apply ? "" : " (dry-run, thêm --apply để nạp)"}`);
if (!apply || pending.length === 0) process.exit(0);

// Kiểm tra hạn mức bằng đúng loại yêu cầu sẽ dùng (nghe một đoạn video 6 giây): yêu cầu chỉ có chữ vẫn thành công dù hạn mức video đã cạn.
async function videoQuotaAvailable(): Promise<boolean> {
  const body = JSON.stringify({ contents: [{ role: "user", parts: [{ fileData: { fileUri: "https://www.youtube.com/watch?v=bR01vpXyItA" }, videoMetadata: { startOffset: "60s", endOffset: "66s" } }, { text: "Transcribe in one short line." }] }], generationConfig: { maxOutputTokens: 40, mediaResolution: "MEDIA_RESOLUTION_LOW" } });
  // Còn hạn mức nếu BẤT KỲ model nào trong chuỗi nạp (3 Flash, 2.5 Flash, 3.5 Flash Lite) còn: script nạp tự rơi xuống model sau.
  for (const model of ASR_BATCH_MODELS.map((m) => m.replace(/^gemini:/, ""))) {
    for (const key of parseGeminiKeys(process.env.GEMINI_API_KEYS)) {
      try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, { method: "POST", headers: { "Content-Type": "application/json", "x-goog-api-key": key }, body, signal: AbortSignal.timeout(40_000) });
        if (res.ok) return true;
      } catch { /* khóa lỗi mạng: thử khóa kế */ }
    }
  }
  return false;
}
if (!(await videoQuotaAvailable())) {
  console.log("Hạn mức Gemini cho yêu cầu nghe video đang cạn (mọi khóa đều lỗi). Chạy lại sau (reset khoảng 14-15 giờ Việt Nam).");
  process.exit(2);
}

let done = 0, failed = 0, consecutive = 0;
for (const id of pending.slice(0, limit)) {
  const started = new Date().toLocaleTimeString("vi-VN");
  let out = "";
  try {
    out = execFileSync("npx", ["tsx", "--conditions=react-server", "--env-file=.env.local", "scripts/transcribe-video.mts", id, "--apply", "--status", status], { encoding: "utf8", env: { ...process.env, NODE_OPTIONS: "--experimental-websocket" }, stdio: ["ignore", "pipe", "pipe"] });
  } catch (e) {
    out = String((e as { stdout?: string; stderr?: string }).stdout ?? "") + String((e as { stderr?: string }).stderr ?? "");
  }
  const ok = out.includes("kind: 'ingested'");
  if (ok) { done++; consecutive = 0; } else { failed++; consecutive++; }
  console.log(`${started} ${id} ${ok ? "OK" : "LỖI"}${ok ? "" : " — " + (out.split("\n").find((l) => /Error|lỗi/.test(l)) ?? "").trim().slice(0, 120)}`);
  if (consecutive >= MAX_CONSECUTIVE_FAILS) { console.log(`Dừng: ${MAX_CONSECUTIVE_FAILS} video liên tiếp lỗi (có thể hết hạn mức Gemini).`); break; }
}
console.log(`Xong đợt: ${done} video nạp được, ${failed} lỗi, còn ${pending.length - done} video trong danh sách. Chạy lại lệnh này ngày mai để nạp tiếp.`);
process.exit(failed > 0 && done === 0 ? 2 : 0);
