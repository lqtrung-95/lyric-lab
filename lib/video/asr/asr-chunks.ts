import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Gemini nghe video YouTube theo từng cửa sổ thời gian: một lần gọi nghe cả video 20 phút vượt 60 giây của Vercel Hobby (đo 2026-10-14: 2 phút video mất 15-25 giây, 4 phút lúc nguội tới 59 giây).
// Mỗi đoạn "sở hữu" một khoảng [ownStart, ownEnd) và được nghe thêm vài giây mỗi đầu để câu nằm ngang ranh giới không bị cắt đôi;
// lúc ghép chỉ giữ dòng có điểm giữa nằm trong khoảng sở hữu của đoạn, nên mỗi câu có đúng một chủ.

/** Độ dài phần sở hữu của mỗi đoạn (giây): ~25 giây xử lý, chừa chỗ cho khóa quá tải phải thử lại trong 60 giây. */
export const ASR_CHUNK_SECONDS = 120;
/** Nghe dư mỗi đầu (giây), dài hơn câu nói thông thường. */
export const ASR_CHUNK_OVERLAP_SECONDS = 6;
/** Video dài hơn mức này không nhận dạng được (chi phí và thời gian chờ). */
export const MAX_ASR_VIDEO_SECONDS = 30 * 60;
/** Đoạn cuối ngắn hơn mức này thì gộp vào đoạn trước, tránh một lần gọi cho vài giây. */
const MIN_TAIL_SECONDS = 45;

export interface AsrChunk {
  index: number;
  ownStart: number;
  ownEnd: number;
  /** Cửa sổ thực sự gửi cho Gemini (đã nới theo overlap, nằm trong [0, durationSec]). */
  windowStart: number;
  windowEnd: number;
}

/** Chia video thành các đoạn nối tiếp nhau, đoạn cuối không ngắn hơn MIN_TAIL_SECONDS. */
export function planAsrChunks(durationSec: number): AsrChunk[] {
  const total = Math.max(1, Math.floor(durationSec));
  let count = Math.max(1, Math.floor(total / ASR_CHUNK_SECONDS));
  if (total - count * ASR_CHUNK_SECONDS >= MIN_TAIL_SECONDS) count++;
  const chunks: AsrChunk[] = [];
  for (let i = 0; i < count; i++) {
    const ownStart = i * ASR_CHUNK_SECONDS;
    const ownEnd = i === count - 1 ? total : (i + 1) * ASR_CHUNK_SECONDS;
    chunks.push({
      index: i, ownStart, ownEnd,
      windowStart: Math.max(0, ownStart - ASR_CHUNK_OVERLAP_SECONDS),
      windowEnd: Math.min(total, ownEnd + ASR_CHUNK_OVERLAP_SECONDS),
    });
  }
  return chunks;
}

/** Giữ các dòng (giờ tuyệt đối của video) có điểm giữa thuộc phần sở hữu của đoạn. */
export function keepOwnedLines(lines: CaptionLine[], chunk: AsrChunk): CaptionLine[] {
  return lines.filter((l) => {
    const mid = (l.start + l.end) / 2;
    return mid >= chunk.ownStart && mid < chunk.ownEnd;
  });
}
