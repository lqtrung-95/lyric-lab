// Tổng hợp SẴN giọng đọc (Azure) cho mọi từ/câu tiếng Trung của Khám phá và lưu vào Storage dùng chung, để bấm loa là nghe giọng tự nhiên ngay
// (không cần gọi Azure, không tính hạn mức từng người, không rơi về giọng máy). Đã có file thì bỏ qua nên chạy lại được và chỉ tốn cho phần mới.
// Mặc định chỉ đếm (dry-run); thêm --apply để tổng hợp thật.
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/prewarm-explore-tts.mts [--apply] [--delay 300] [--limit 500]
// Gặp 429 (Azure giới hạn tốc độ, gói miễn phí ~20 lượt/phút) thì đợi 65 giây rồi thử lại; hết hạn mức tháng thì dừng và báo.
import { createClient } from "@supabase/supabase-js";
import ws from "ws";
import { collectExploreTtsTexts } from "@/lib/explore/collect-tts-texts";
import { azureSpeechEndpoints } from "@/lib/env/server-env";
import { synthesizeWithFailover, TtsUnavailableError } from "@/lib/tts/azure-speech";
import { TTS_BUCKET, storeAudio } from "@/lib/tts/tts-audio-store";
import { ttsStoragePath } from "@/lib/tts/tts-text";

const arg = (name: string, fallback: number) => { const i = process.argv.indexOf(name); return i >= 0 ? Number(process.argv[i + 1]) : fallback; };
const apply = process.argv.includes("--apply");
const delay = arg("--delay", 300);
const limit = arg("--limit", Infinity);

const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
/** Storage thỉnh thoảng trả 502/503 tạm thời: thử lại vài lần (đợi tăng dần) trước khi bỏ cuộc. */
async function withRetry<T>(fn: () => Promise<T>, tries = 4): Promise<T> {
  for (let attempt = 1; ; attempt++) {
    try { return await fn(); } catch (e) {
      const status = (e as { status?: number }).status ?? 0;
      if (attempt >= tries || (status !== 0 && status < 500)) throw e;
      console.log(`Storage lỗi ${status || "mạng"}, thử lại lần ${attempt}/${tries - 1} sau ${attempt * 3} giây…`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }
}

const texts = collectExploreTtsTexts();
const missing: string[] = [];
for (const t of texts) {
  const { data } = await withRetry(() => sb.storage.from(TTS_BUCKET).exists(ttsStoragePath(t)));
  if (!data) missing.push(t);
}
const chars = missing.reduce((n, t) => n + t.length, 0);
console.log(`${texts.length} từ/câu, đã có giọng: ${texts.length - missing.length}, còn thiếu: ${missing.length} (khoảng ${chars} ký tự)`);
if (!apply) { console.log("Dry-run: thêm --apply để tổng hợp."); process.exit(0); }

const endpoints = azureSpeechEndpoints();
if (endpoints.length === 0) throw new Error("Thiếu AZURE_SPEECH_KEY / AZURE_SPEECH_REGION");
let done = 0;
for (const t of missing.slice(0, limit)) {
  for (let attempt = 0; ; attempt++) {
    try {
      await storeAudio(sb, t, await synthesizeWithFailover(t, endpoints));
      done++;
      break;
    } catch (e) {
      const status = e instanceof TtsUnavailableError ? e.status : undefined;
      if (status === 429 && attempt < 3) { console.log(`429 (giới hạn tốc độ), đợi 65 giây… (${done}/${missing.length})`); await new Promise((r) => setTimeout(r, 65_000)); continue; }
      console.error(`Dừng ở "${t}" (${(e as Error).message}). Đã tạo ${done}/${missing.length}. Chạy lại để tiếp tục.`);
      process.exit(1);
    }
  }
  if (done % 25 === 0) console.log(`${done}/${missing.length}`);
  await new Promise((r) => setTimeout(r, delay));
}
console.log(`Xong: đã tạo ${done}/${missing.length} file giọng.`);
