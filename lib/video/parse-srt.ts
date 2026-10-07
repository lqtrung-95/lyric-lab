import type { CaptionLine } from "@/lib/captions/caption-provider-types";

const TIME = /(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})/;
const toSeconds = (m: RegExpMatchArray) => Number(m[1]) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0")) / 1000;

/**
 * Đọc file phụ đề SRT thành các dòng có mốc thời gian (giây). Chịu được BOM, xuống dòng kiểu Windows, số thứ tự bị thiếu và cue nhiều dòng
 * (nối bằng dấu cách). Cue sai định dạng thì bỏ qua thay vì làm hỏng cả file.
 */
export function parseSrt(text: string): CaptionLine[] {
  const lines: CaptionLine[] = [];
  for (const block of text.replace(/^﻿/, "").replace(/\r\n?/g, "\n").split(/\n{2,}/)) {
    const rows = block.split("\n").map((r) => r.trim()).filter(Boolean);
    const arrowAt = rows.findIndex((r) => r.includes("-->"));
    if (arrowAt < 0) continue;
    const [from, to] = rows[arrowAt].split("-->");
    const start = from.match(TIME);
    const end = to?.match(TIME);
    const content = rows.slice(arrowAt + 1).join(" ").replace(/\s+/g, " ").trim();
    if (!start || !end || !content) continue;
    lines.push({ text: content, start: toSeconds(start), end: toSeconds(end) });
  }
  return lines;
}
