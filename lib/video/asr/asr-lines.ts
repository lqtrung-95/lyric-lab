import type { CaptionLine } from "@/lib/captions/caption-provider-types";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";

// Biến kết quả nhận dạng giọng nói (Gemini nghe video, Whisper nghe file âm thanh) thành các dòng phụ đề sạch để đi qua lõi nạp video như phụ đề thường.
// Mô hình nhận dạng hay: trả mốc giờ chồng nhau, lặp một câu nhiều lần khi gặp nhạc/im lặng, chèn câu không có chữ Hán; mọi thứ đó được dọn ở đây.

const HAN = /\p{Script=Han}/u;
/** Một câu ngắn hơn mức này mà vẫn nối được vào câu sau thì cho đủ thời gian đọc. */
const MIN_LINE_SECONDS = 0.8;
/** Số lần lặp liền nhau của một câu từ đó trở đi bị coi là hỏng. */
const MAX_IDENTICAL_IN_ROW = 3;
const MAX_LINE_CHARS = 120;
/** Tốc độ nói tiếng Trung khoảng 4-5 chữ mỗi giây. */
const SECONDS_PER_CHAR = 0.25;
const SPEECH_PADDING_SECONDS = 0.5;

export interface RawAsrSegment { start: number; end: number; text: string }

/** Mốc giờ mô hình trả: số giây, hoặc chuỗi "MM:SS" / "H:MM:SS" (có thể có phần thập phân ở giây). Trả null nếu không đọc được. */
export function parseTimestamp(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) && value >= 0 ? value : null;
  if (typeof value !== "string") return null;
  const parts = value.trim().split(":");
  if (parts.length < 1 || parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p))) return null;
  return parts.reduce((total, p) => total * 60 + Number(p), 0);
}

/**
 * Đọc JSON mô hình trả về (mảng, hoặc {segments|lines|captions: mảng}); bỏ hàng hỏng. Mốc giờ là giây hoặc "MM:SS". Trả null khi không phải JSON dạng danh sách
 * (khác với `[]` là đoạn không có lời).
 */
export function parseAsrJson(raw: string): RawAsrSegment[] | null {
  const cleaned = raw.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let data: unknown;
  try { data = JSON.parse(cleaned); } catch { return null; }
  const list = Array.isArray(data) ? data : data && typeof data === "object" ? ((data as Record<string, unknown>).segments ?? (data as Record<string, unknown>).lines ?? (data as Record<string, unknown>).captions) : null;
  if (!Array.isArray(list)) return null;
  const out: RawAsrSegment[] = [];
  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const { start, end, text } = item as Record<string, unknown>;
    const from = parseTimestamp(start);
    const to = parseTimestamp(end);
    if (typeof text !== "string" || from === null || to === null) continue;
    out.push({ start: from, end: to, text });
  }
  return out;
}

/** Số chữ Hán một giây mà người nói thực tế không vượt nổi; dòng nhanh hơn mức này là mốc giờ bị nén sai. */
const MAX_CHARS_PER_SECOND = 14;

/**
 * Phát hiện kết quả có mốc giờ hỏng (đo 2026-10-14: Gemini có lúc trả hàng chục câu cách nhau 0,01 giây, hoặc gom cả đoạn vào vài giây): từ 8 dòng trở đi,
 * hơn 30% dòng "nói" nhanh hơn người thật, hoặc toàn bộ lời chỉ nằm trong dưới 30% cửa sổ. Đoạn ít dòng thì không đủ dữ liệu để kết luận.
 */
export function timingLooksBroken(segments: RawAsrSegment[], windowSeconds: number): boolean {
  if (segments.length < 8) return false;
  const tooFast = segments.filter((s) => s.text.length / Math.max(s.end - s.start, 0.05) > MAX_CHARS_PER_SECOND).length;
  if (tooFast / segments.length > 0.3) return true;
  const span = Math.max(...segments.map((s) => s.end)) - Math.min(...segments.map((s) => s.start));
  return span < windowSeconds * 0.3;
}

/** Dọn dòng: đổi sang chữ GIẢN THỂ (bản chép tự động luôn lưu giản thể, kể cả khi người nói/chữ trên hình là phồn thể), bỏ dòng không có chữ Hán/quá dài, gom câu lặp, sắp theo giờ, cắt chồng lấn, ép trong [0, durationSec] và mỗi dòng dài tối thiểu `MIN_LINE_SECONDS`. */
export function cleanAsrLines(segments: RawAsrSegment[], durationSec: number): CaptionLine[] {
  const sorted = segments
    .map((s) => ({ start: s.start, end: s.end, text: toSimplifiedChinese(s.text.replace(/\s+/g, " ").trim()) }))
    .filter((s) => s.text.length > 0 && s.text.length <= MAX_LINE_CHARS && HAN.test(s.text))
    .sort((a, b) => a.start - b.start);
  // Một câu lặp liền nhau từ MAX_IDENTICAL_IN_ROW lần trở lên là mô hình "kẹt vòng lặp" (hay gặp ở nhạc nền/im lặng): giữ lần đầu. Lặp ít hơn có thể là người nói thật.
  const deduped: typeof sorted = [];
  for (let i = 0; i < sorted.length; ) {
    let j = i;
    while (j < sorted.length && sorted[j].text === sorted[i].text) j++;
    deduped.push(...sorted.slice(i, j - i >= MAX_IDENTICAL_IN_ROW ? i + 1 : j));
    i = j;
  }
  const lines: CaptionLine[] = [];
  for (let i = 0; i < deduped.length; i++) {
    const start = Math.min(Math.max(0, deduped[i].start), Math.max(0, durationSec - MIN_LINE_SECONDS));
    const nextStart = i + 1 < deduped.length ? deduped[i + 1].start : durationSec;
    // Gemini chỉ cho mốc giờ nguyên giây nên câu hay kết thúc sớm tới ~1 giây: cho dòng đủ thời gian nói theo độ dài chữ (chặn ở đầu câu kế), để nghe lại/chép/nói theo không bị cắt cụt.
    const wantedEnd = Math.max(deduped[i].end, start + MIN_LINE_SECONDS, start + deduped[i].text.length * SECONDS_PER_CHAR + SPEECH_PADDING_SECONDS);
    const end = Math.min(wantedEnd, Math.max(nextStart, start + MIN_LINE_SECONDS), durationSec);
    lines.push({ text: deduped[i].text, start: round1(start), end: round1(Math.max(end, start + 0.1)) });
  }
  return lines;
}

const round1 = (n: number) => Math.round(n * 10) / 10;
