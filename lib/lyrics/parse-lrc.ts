import type { CaptionLine } from "@/lib/captions/caption-provider-types";

const TIME_TAG = /\[(\d{1,3}):(\d{2})(?:[.:](\d{1,3}))?\]/g;

/**
 * Đọc lời dạng LRC (`[mm:ss.xx] text`) thành dòng có start/end.
 * end của dòng = start của dòng kế; dòng cuối kéo dài `lastLineSec` giây.
 * Dòng rỗng (khoảng lặng) vẫn đóng vai mốc kết thúc của dòng trước rồi bị loại.
 */
export function parseLrc(lrc: string, lastLineSec = 5): CaptionLine[] {
  const stamped: { start: number; text: string }[] = [];
  for (const raw of lrc.split("\n")) {
    const tags = [...raw.matchAll(TIME_TAG)];
    if (tags.length === 0) continue;
    const text = raw.replace(TIME_TAG, "").trim();
    for (const t of tags) {
      const frac = t[3] ? Number(t[3].padEnd(3, "0")) / 1000 : 0;
      stamped.push({ start: Number(t[1]) * 60 + Number(t[2]) + frac, text });
    }
  }
  stamped.sort((a, b) => a.start - b.start);

  const lines: CaptionLine[] = [];
  stamped.forEach((cur, i) => {
    if (!cur.text) return;
    const next = stamped[i + 1];
    lines.push({ text: cur.text, start: cur.start, end: next ? next.start : cur.start + lastLineSec });
  });
  return lines;
}
