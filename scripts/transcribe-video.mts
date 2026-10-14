// Tạo phụ đề tiếng Trung cho video YouTube KHÔNG có phụ đề, chạy trên máy admin, rồi nạp vào kho video với nhãn "nhận dạng tự động".
// Khác nút trên web: không bị trần 60 giây và 30 phút của server, nên dùng được cho video dài hoặc khi muốn bản chuẩn hơn.
//   Mặc định chỉ chép và in thử (dry-run), lưu bản chép vào tmp/transcribe/<id>.<engine>.json để xem/sửa; thêm --apply để nạp vào DB:
//   NODE_OPTIONS=--experimental-websocket npx tsx --conditions=react-server --env-file=.env.local scripts/transcribe-video.mts <link|id> [--engine gemini|groq|local] [--status listed|draft] [--force] [--apply]
// --engine gemini (mặc định): Gemini nghe thẳng link YouTube từng đoạn 2 phút (như nút trên web nhưng chạy tuần tự, không cần yt-dlp/ffmpeg). Đo 2026-10-14: chép đúng hơn Whisper turbo, câu mịn hơn.
// --engine groq: Whisper large-v3-turbo qua Groq (GROQ_API_KEY), ~0,01 USD cho video 20 phút, chạy trong vài chục giây.
//   Cần `yt-dlp` và `ffmpeg` trong PATH (brew install yt-dlp ffmpeg). Mốc giờ của Whisper thô hơn (cỡ 3 giây) và hay sai từ đồng âm.
// --engine local: lệnh `whisper` của openai-whisper (pip install openai-whisper), model large-v3, miễn phí nhưng chậm (vài phút đến vài chục phút).
// Bản chép đã lưu được dùng lại ở lần chạy sau (đỡ tốn tiền/thời gian); --force để chép lại. Có thể sửa tay file JSON rồi chạy lại với --apply.
import { createClient } from "@supabase/supabase-js";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import ws from "ws";
import { createChat } from "@/lib/analysis/server-deps";
import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { lookupWords } from "@/lib/dictionary/lookup-words";
import { getServerEnv } from "@/lib/env/server-env";
import { planAsrChunks } from "@/lib/video/asr/asr-chunks";
import { cleanAsrLines, type RawAsrSegment } from "@/lib/video/asr/asr-lines";
import { GROQ_MAX_AUDIO_BYTES, transcribeWithGroq, whisperSegmentsToRaw } from "@/lib/video/asr/groq-whisper";
import { transcribeChunkWithGemini } from "@/lib/video/asr/transcribe-chunk-gemini";
import { FixedCaptionProvider } from "@/lib/video/fixed-caption-provider";
import { ingestVideo } from "@/lib/video/ingest-video";
import { translateLines } from "@/lib/video/translate-lines";
import { fetchVideosMeta } from "@/lib/video/youtube-data-api";
import { parseVideoId } from "@/lib/youtube/parse-video-id";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";

const args = process.argv.slice(2);
const flag = (name: string) => args.includes(`--${name}`);
const opt = (name: string) => { const i = args.indexOf(`--${name}`); return i >= 0 ? args[i + 1] : undefined; };
const videoId = parseVideoId(args.find((a) => !a.startsWith("--") && a !== opt("engine") && a !== opt("status")) ?? "");
if (!videoId) throw new Error("Cần link hoặc mã video YouTube");
const engine = opt("engine") ?? "gemini";
if (engine !== "gemini" && engine !== "groq" && engine !== "local") throw new Error("--engine chỉ nhận gemini, groq hoặc local");
const status = opt("status") === "draft" ? "draft" : "listed";
const apply = flag("apply");

const env = getServerEnv();
const meta = (await fetchVideosMeta([videoId], env.YOUTUBE_DATA_API_KEY)).get(videoId);
if (!meta) throw new Error("Không đọc được thông tin video (riêng tư hoặc đã xóa?)");
console.log(`${meta.title} · ${meta.channelTitle} · ${Math.round(meta.durationSec / 60)} phút${meta.embeddable ? "" : " · KHÔNG nhúng được"}`);

const dir = join("tmp", "transcribe");
mkdirSync(dir, { recursive: true });
const jsonPath = join(dir, `${videoId}.${engine}.json`);
const run = (cmd: string, cmdArgs: string[]) => execFileSync(cmd, cmdArgs, { stdio: ["ignore", "inherit", "inherit"] });

let lines: CaptionLine[];
if (existsSync(jsonPath) && !flag("force")) {
  lines = JSON.parse(readFileSync(jsonPath, "utf8")) as CaptionLine[];
  console.log(`Dùng lại bản chép đã lưu ${jsonPath} (${lines.length} dòng; --force để chép lại)`);
} else {
  let segments: RawAsrSegment[] = [];
  if (engine === "gemini") {
    // Gemini tự lấy video từ link; mỗi đoạn thử lại tối đa 3 lần (khóa quá tải thường qua đi sau vài giây).
    const chat = createChat(env);
    const chunks = planAsrChunks(meta.durationSec);
    for (const chunk of chunks) {
      for (let attempt = 1; ; attempt++) {
        try {
          console.log(`Gemini nghe đoạn ${chunk.index + 1}/${chunks.length} (${chunk.ownStart}–${chunk.ownEnd}s)`);
          segments.push(...(await transcribeChunkWithGemini(chat, videoId, chunk, meta.durationSec)));
          break;
        } catch (e) {
          if (attempt >= 3) throw e;
          console.log(`  lỗi (${(e as Error).message.slice(0, 80)}), thử lại sau 5 giây`);
          await new Promise((r) => setTimeout(r, 5000));
        }
      }
    }
  } else {
    // 1) Tải audio rồi nén về mono 16 kHz 32 kbps: Whisper chỉ cần chừng đó, 20 phút còn ~5 MB (dưới trần 25 MB của Groq).
    const raw = join(dir, `${videoId}.source`);
    run("yt-dlp", ["-f", "bestaudio", "--no-playlist", "-o", `${raw}.%(ext)s`, `https://www.youtube.com/watch?v=${videoId}`]);
    const source = readdirSync(dir).find((f) => f.startsWith(`${videoId}.source.`));
    if (!source) throw new Error("yt-dlp không tạo ra file âm thanh");
    const mp3 = join(dir, `${videoId}.audio.mp3`);
    run("ffmpeg", ["-y", "-loglevel", "error", "-i", join(dir, source), "-vn", "-ac", "1", "-ar", "16000", "-b:a", "32k", mp3]);

    // 2) Nhận dạng. Groq: file quá 24 MB thì cắt đoạn 20 phút và cộng dồn mốc giờ; local: whisper CLI xuất JSON.
    if (engine === "groq") {
      const key = process.env.GROQ_API_KEY;
      if (!key) throw new Error("Thiếu GROQ_API_KEY trong .env.local");
      const parts: { file: string; offset: number }[] = [];
      if (statSync(mp3).size <= GROQ_MAX_AUDIO_BYTES) parts.push({ file: mp3, offset: 0 });
      else {
        run("ffmpeg", ["-y", "-loglevel", "error", "-i", mp3, "-f", "segment", "-segment_time", "1200", "-c", "copy", join(dir, `${videoId}.part%02d.mp3`)]);
        readdirSync(dir).filter((f) => f.startsWith(`${videoId}.part`)).sort().forEach((f, i) => parts.push({ file: join(dir, f), offset: i * 1200 }));
      }
      for (const p of parts) {
        console.log(`Groq Whisper: ${p.file}`);
        segments.push(...whisperSegmentsToRaw(await transcribeWithGroq(readFileSync(p.file), p.file.split("/").pop()!, key), p.offset));
      }
    } else {
      run("whisper", [mp3, "--language", "zh", "--model", "large-v3", "--initial_prompt", "以下是普通话的句子。", "--output_format", "json", "--output_dir", dir]);
      const out = JSON.parse(readFileSync(join(dir, `${videoId}.audio.json`), "utf8")) as { segments: { start: number; end: number; text: string }[] };
      segments = out.segments.map((s) => ({ start: s.start, end: s.end, text: toSimplifiedChinese(s.text) }));
    }
  }
  lines = cleanAsrLines(segments, meta.durationSec);
  writeFileSync(jsonPath, JSON.stringify(lines, null, 2));
  console.log(`Đã chép ${lines.length} dòng → ${jsonPath}`);
}

lines.slice(0, 12).forEach((l) => console.log(`${l.start.toFixed(1).padStart(7)}–${l.end.toFixed(1).padEnd(7)} ${l.text}`));
if (lines.length > 12) console.log(`… và ${lines.length - 12} dòng nữa`);
if (!apply) { console.log("\nDry-run: xem/sửa file JSON ở trên rồi chạy lại với --apply để nạp vào DB."); process.exit(0); }

// 3) Nạp: cùng lõi với nút "Thêm video" (chia từ, pinyin, level từ từ điển; AI dịch tiếng Việt), gắn nhãn nhận dạng tự động.
const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false }, realtime: { transport: ws as never } });
const chat = createChat(env);
const outcome = await ingestVideo(
  { sb, provider: new FixedCaptionProvider(lines), lookup: (terms) => lookupWords(sb as never, terms) },
  { meta, sourceId: null, status, transcriptSource: "auto", translateMissing: (prepared) => translateLines(prepared, chat, undefined, { title: meta.title }) },
);
console.log(outcome);
process.exit(0);
