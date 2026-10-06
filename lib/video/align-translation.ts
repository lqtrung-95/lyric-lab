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
