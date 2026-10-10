import type { CaptionLine } from "@/lib/captions/caption-provider-types";

const overlap = (a: CaptionLine, b: CaptionLine) => Math.max(0, Math.min(a.end, b.end) - Math.max(a.start, b.start));

/**
 * Ghép bản dịch (track tiếng Việt) vào các dòng tiếng Trung theo thời gian. Mỗi dòng dịch thuộc về đúng MỘT dòng tiếng Trung:
 * dòng có thời gian chồng lấn nhiều nhất (hai track của cùng video thường cùng mốc, nhưng dòng dịch có thể dài hơn hoặc ngắn hơn
 * và chồng lên hai dòng). Dòng dịch không chồng lên dòng nào thì bỏ. Một dòng tiếng Trung nhận nhiều dòng dịch thì nối theo thứ tự
 * bằng dấu cách. Trả mảng cùng độ dài `zh`; phần tử null = không có bản dịch cho dòng đó.
 */
export function alignTranslations(zh: CaptionLine[], vi: CaptionLine[]): (string | null)[] {
  const parts: string[][] = zh.map(() => []);
  for (const v of vi) {
    const text = v.text.replace(/\s+/g, " ").trim();
    if (!text) continue;
    let best = -1;
    let bestOverlap = 0;
    zh.forEach((z, i) => {
      const o = overlap(z, v);
      if (o > bestOverlap) {
        best = i;
        bestOverlap = o;
      }
    });
    if (best >= 0) parts[best].push(text);
  }
  return parts.map((p) => (p.length ? p.join(" ") : null));
}

/** Phụ đề tiếng Việt chỉ dùng thẳng làm bản dịch khi ghép đủ tốt: số dòng cùng cỡ với bản tiếng Trung và phần lớn dòng tiếng Trung có bản dịch. Lệch hơn thì dịch bằng AI cho chắc. */
export const MIN_LINE_COUNT_RATIO = 0.5;
export const MAX_LINE_COUNT_RATIO = 2;
export const MIN_ALIGNED_SHARE = 0.7;
/** Một dòng dịch coi là "vắt ngang" khi dưới chừng này thời lượng của nó nằm trong dòng tiếng Trung khớp nhất (nó chia câu khác hẳn track tiếng Trung). */
export const STRADDLE_MIN_FIT = 0.6;
/** Quá chừng này số dòng dịch vắt ngang thì bản ghép là các mẩu câu lệch chỗ (vd. "Đừng" / "bận tâm, thế thôi"), tệ hơn dịch máy cả bài. */
export const MAX_STRADDLE_SHARE = 0.25;

/**
 * Tỉ lệ dòng dịch vắt ngang nhiều dòng tiếng Trung. Hai track cùng người làm thì cùng cách chia câu nên gần 0; track tiếng Việt do YouTube dịch tự động từ phụ đề
 * tự động thường chia câu theo cách khác: số dòng và độ phủ vẫn "đạt" nhưng từng dòng ghép ra thiếu hoặc thừa nửa câu.
 */
export function straddleShare(zh: CaptionLine[], vi: CaptionLine[]): number {
  let total = 0;
  let straddling = 0;
  for (const v of vi) {
    const duration = v.end - v.start;
    if (!v.text.trim() || duration <= 0) continue;
    total++;
    const best = zh.reduce((max, z) => Math.max(max, overlap(z, v)), 0);
    if (best / duration < STRADDLE_MIN_FIT) straddling++;
  }
  return total === 0 ? 0 : straddling / total;
}

export function isUsableTranslationTrack(zhLineCount: number, viLineCount: number, alignedCount: number, straddle = 0): boolean {
  if (zhLineCount === 0 || viLineCount === 0) return false;
  const ratio = viLineCount / zhLineCount;
  return ratio >= MIN_LINE_COUNT_RATIO && ratio <= MAX_LINE_COUNT_RATIO && alignedCount / zhLineCount >= MIN_ALIGNED_SHARE && straddle <= MAX_STRADDLE_SHARE;
}
