import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { keepOwnedLines, type AsrChunk } from "./asr-chunks";
import { parseAsrJson, timingLooksBroken } from "./asr-lines";

// Nhờ Gemini nghe MỘT đoạn của video YouTube công khai (Google tự lấy video, máy chủ ta không tải gì) và chép lời nói tiếng Trung kèm mốc giờ.
// Chỉ Gemini nghe được video; model đứng sau là dự phòng khi model đầu hết hạn mức/quá tải/trả mốc giờ hỏng. Dùng tên model cụ thể, không dùng bí danh `-latest`.
export const ASR_MODELS = ["gemini:gemini-3-flash-preview", "gemini:gemini-2.5-flash", "gemini:gemini-3.5-flash-lite"];
// 3.5 Flash Lite đứng cuối vì hạn mức ngày lớn gấp 25 lần hai model trên (500 so với 20 yêu cầu/khóa) nhưng chép kém hơn một bậc (đo 2026-10-17: câu dài hơn, vài lỗi tên riêng; mốc giờ khớp).
// Cần có nó cả ở nút trên web: video 28 phút (14 đoạn, phải đủ cả 14) đo 2026-10-19 chỉ với hai model đầu thì 3/14 đoạn bị 429 nên cả video thất bại.
/** Cùng chuỗi model cho script nạp hàng loạt. */
export const ASR_BATCH_MODELS = ASR_MODELS;
/** Một lần gọi nghe 2 phút (+12 giây dư) đo 15-25 giây; hạn chót này vẫn chừa chỗ để route kịp trả lỗi trong 60 giây. */
export const ASR_CALL_TIMEOUT_MS = 50_000;
const MAX_OUTPUT_TOKENS = 8192;
/** Mốc giờ lệch khỏi cửa sổ được nghe quá mức này là mô hình tưởng tượng, loại dòng đó. */
const WINDOW_SLACK_SECONDS = 3;

// Mốc giờ phải là "MM:SS" trên đồng hồ của CẢ video: đo thực tế model hay đọc số giây từ đầu video (7:57 thành 7.57) và gán sai khi bắt tính từ đầu đoạn
// (cả đoạn bị nén vào 3 giây), còn khi cho dùng đồng hồ của video thì ổn định.
const SYSTEM = `You are a speech-transcription engine for Mandarin Chinese learners.
Transcribe ONLY the words that are spoken aloud in the video clip. ALWAYS write Simplified Chinese characters (简体字), never Traditional (繁體字), even when the speaker is from Taiwan/Hong Kong or the on-screen text is Traditional. Never translate.
Ignore on-screen text, subtitles burned into the picture, music, lyrics of background songs and sound effects. If a stretch has no speech, output nothing for it. Never invent or repeat words.
Split the speech into short sentences or clauses (about 1-10 seconds each, one line each).
Timestamps are MM:SS (or H:MM:SS) on the ORIGINAL VIDEO timeline, the same clock as the YouTube player: a clip that starts at 4:00 begins around 04:00. Never restart the clock at 00:00 for a later clip.
Reply with a JSON array only: [{"start": "MM:SS", "end": "MM:SS", "text": string}]. If there is no speech at all, reply [].`;

/** Nghe một đoạn và trả các dòng phụ đề theo giờ tuyệt đối của video (đã lọc theo phần sở hữu của đoạn). Ném lỗi khi mọi model đều hỏng. */
export async function transcribeChunkWithGemini(chat: ChatFn, videoId: string, chunk: AsrChunk, durationSec: number, models: readonly string[] = ASR_MODELS): Promise<CaptionLine[]> {
  let lastError: unknown = new Error("không có model nhận dạng");
  for (const model of models) {
    try {
      const raw = await chat({
        model, system: SYSTEM, maxTokens: MAX_OUTPUT_TOKENS, timeoutMs: ASR_CALL_TIMEOUT_MS,
        user: `Transcribe the speech in this clip. The clip covers ${formatClock(chunk.windowStart)} to ${formatClock(chunk.windowEnd)} of the video.`,
        video: { url: `https://www.youtube.com/watch?v=${videoId}`, startSec: chunk.windowStart, endSec: chunk.windowEnd },
      });
      const parsed = parseAsrJson(raw);
      if (!parsed) throw new Error("Gemini trả bản chép không đọc được");
      const inWindow = parsed.filter((s) => s.start >= chunk.windowStart - WINDOW_SLACK_SECONDS && s.start <= chunk.windowEnd + WINDOW_SLACK_SECONDS);
      // Phần lớn dòng nằm ngoài cửa sổ: mô hình dùng sai đồng hồ (ví dụ tính từ đầu đoạn), không đoán lại mà thử model khác.
      if (parsed.length >= 8 && inWindow.length < parsed.length * 0.7) throw new Error("Gemini trả mốc giờ ngoài đoạn được nghe");
      if (timingLooksBroken(inWindow, chunk.windowEnd - chunk.windowStart)) throw new Error("Gemini trả mốc giờ bị nén sai");
      return keepOwnedLines(inWindow.map((s) => ({ text: s.text, start: s.start, end: Math.max(s.end, s.start) })), chunk).filter((l) => l.start < durationSec);
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError;
}

const formatClock = (sec: number) => `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
