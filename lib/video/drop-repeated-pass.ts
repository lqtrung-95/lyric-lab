import type { CaptionLine } from "@/lib/captions/caption-provider-types";

const norm = (t: string) => t.replace(/\s+/g, "");
/** Số dòng đầu phải giống nhau để coi là bản lặp lại, đủ nhiều để không nhầm với hai đoạn tình cờ cùng vài câu chào. */
const PROBE = 3;
/** Mốc giờ phải lùi ít nhất ngần này (giây) so với dòng trước mới coi là bắt đầu lại từ đầu. */
const MIN_RESET_SEC = 1;

/**
 * Bản chép lời bị lấy hai lần (hai khung bản chép lời cùng nằm trong trang YouTube): toàn bộ danh sách lặp lại từ mốc 0. Tìm chỗ mốc giờ lùi về
 * và các dòng sau đó khớp với các dòng đầu, rồi cắt bỏ từ đó trở đi (lặp nhiều lần cũng cắt hết). Danh sách không lặp thì giữ nguyên.
 */
export function dropRepeatedPass(lines: CaptionLine[]): CaptionLine[] {
  for (let i = PROBE; i < lines.length; i++) {
    if (lines[i].start > lines[i - 1].start - MIN_RESET_SEC) continue;
    const probe = Math.min(PROBE, lines.length - i);
    let same = true;
    for (let k = 0; k < probe && same; k++) same = norm(lines[i + k].text) === norm(lines[k].text);
    if (same && probe === PROBE) return lines.slice(0, i);
  }
  return lines;
}
