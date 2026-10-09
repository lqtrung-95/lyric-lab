import type { CaptionLine } from "@/lib/captions/caption-provider-types";

/** Phụ đề có tỉ lệ chữ Hán dưới mức này (trên các ký tự chữ, không tính số/dấu/khoảng trắng) coi là không phải tiếng Trung. */
export const MIN_CHINESE_RATIO = 0.3;

const HAN = /\p{Script=Han}/gu;
const LETTERS = /[\p{L}]/gu;

/** Tỉ lệ chữ Hán trong tổng số chữ cái của các dòng (0 khi không có chữ nào). Phát hiện việc dán nhầm bản chép lời tiếng Anh/Việt. */
export function chineseRatio(lines: CaptionLine[]): number {
  const text = lines.map((l) => l.text).join("");
  const letters = text.match(LETTERS)?.length ?? 0;
  return letters === 0 ? 0 : (text.match(HAN)?.length ?? 0) / letters;
}

export const isMostlyChinese = (lines: CaptionLine[]) => chineseRatio(lines) >= MIN_CHINESE_RATIO;
