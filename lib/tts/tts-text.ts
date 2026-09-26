import { createHash } from "node:crypto";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import { TTS_RATE, TTS_VOICE } from "./build-ssml";

const HAN = /\p{Script=Han}/u;
export const MAX_TTS_CHARS = 40;

/**
 * Chuẩn hóa văn bản cần đọc: giản thể, bỏ khoảng trắng thừa. Chỉ nhận từ/câu ngắn có chữ Hán (không dùng làm dịch vụ đọc
 * văn bản tùy ý); trả null nếu không hợp lệ.
 */
export function normalizeTtsText(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const text = toSimplifiedChinese(input.normalize("NFC").replace(/\s+/g, " ").trim());
  return text.length > 0 && text.length <= MAX_TTS_CHARS && HAN.test(text) ? text : null;
}

/** Đường dẫn file trong Storage: theo giọng + tốc độ + nội dung, nên đổi giọng thì không dùng nhầm file cũ. */
export function ttsStoragePath(text: string): string {
  const hash = createHash("sha256").update(`${TTS_VOICE}|${TTS_RATE}|${text}`).digest("hex");
  return `${TTS_VOICE}/${hash.slice(0, 2)}/${hash}.mp3`;
}
