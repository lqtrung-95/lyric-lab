import type { CaptionLine } from "@/lib/captions/caption-provider-types";

// Đọc phụ đề người dùng dán vào ô "Thêm video": file SRT/VTT, hoặc văn bản copy từ bảng "Bản chép lời" của YouTube (mốc giờ một dòng, lời ở dòng sau,
// hoặc mốc và lời cùng dòng). Văn bản không có mốc giờ thì không dùng được vì chép chính tả/shadowing phát lại từng đoạn theo mốc.

export const MAX_TRANSCRIPT_LINES = 4000;
const MAX_LINE_CHARS = 300;
// Dòng cuối của bản chép lời không có mốc kết thúc: cho nó dài tối đa chừng này (hoặc tới hết video nếu biết thời lượng).
const LAST_LINE_SECONDS = 5;

const CUE_TIME = /(?:(\d{1,2}):)?(\d{1,2}):(\d{2})[.,](\d{1,3})/;
const PANEL_TIME = /^(?:(\d{1,2}):)?(\d{1,2}):(\d{2})$/;
const PANEL_INLINE = /^((?:\d{1,2}:)?\d{1,2}:\d{2})\s+(\S.*)$/;

const cueSeconds = (m: RegExpMatchArray) => Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]) + Number(m[4].padEnd(3, "0")) / 1000;
const panelSeconds = (m: RegExpMatchArray) => Number(m[1] ?? 0) * 3600 + Number(m[2]) * 60 + Number(m[3]);
const clean = (t: string) => t.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().slice(0, MAX_LINE_CHARS);

function parseCues(text: string): CaptionLine[] {
  const lines: CaptionLine[] = [];
  for (const block of text.split(/\n{2,}/)) {
    const rows = block.split("\n").map((r) => r.trim()).filter(Boolean);
    const arrowAt = rows.findIndex((r) => r.includes("-->"));
    if (arrowAt < 0) continue;
    const [from, to] = rows[arrowAt].split("-->");
    const start = from.match(CUE_TIME);
    const end = to?.match(CUE_TIME);
    const content = clean(rows.slice(arrowAt + 1).join(" "));
    if (start && end && content) lines.push({ text: content, start: cueSeconds(start), end: cueSeconds(end) });
  }
  return lines;
}

function parsePanel(rows: string[], durationSec: number | undefined): CaptionLine[] {
  const entries: { start: number; text: string }[] = [];
  for (const row of rows) {
    const only = row.match(PANEL_TIME);
    if (only) { entries.push({ start: panelSeconds(only), text: "" }); continue; }
    const inline = row.match(PANEL_INLINE);
    const time = inline?.[1].match(PANEL_TIME);
    if (inline && time) { entries.push({ start: panelSeconds(time), text: inline[2] }); continue; }
    const last = entries.at(-1);
    if (last) last.text = `${last.text} ${row}`.trim();
  }
  const filled = entries.map((e) => ({ ...e, text: clean(e.text) })).filter((e) => e.text);
  return filled.map((e, i) => {
    const next = filled[i + 1]?.start;
    const cap = durationSec !== undefined ? Math.min(e.start + LAST_LINE_SECONDS, durationSec) : e.start + LAST_LINE_SECONDS;
    return { text: e.text, start: e.start, end: next !== undefined && next > e.start ? next : Math.max(cap, e.start + 1) };
  });
}

/**
 * Trả các dòng có mốc giờ (giây) từ văn bản dán vào; mảng rỗng nếu không nhận ra định dạng nào có mốc giờ.
 * `durationSec` (nếu biết) chặn mốc kết thúc của dòng cuối không vượt quá hết video.
 */
export function parsePastedTranscript(raw: string, durationSec?: number): CaptionLine[] {
  const text = raw.replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const cues = parseCues(text);
  const lines = cues.length > 0 ? cues : parsePanel(text.split("\n").map((r) => r.trim()).filter(Boolean), durationSec);
  return lines.slice(0, MAX_TRANSCRIPT_LINES);
}
