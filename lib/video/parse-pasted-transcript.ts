import { dropRepeatedPass } from "./drop-repeated-pass";
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

/** Các con số khác 0 của một chuỗi (hoặc [0] nếu toàn số 0), để so mốc giờ với nhãn đọc to của nó bất kể ngôn ngữ. */
const significantNumbers = (nums: number[]): number[] => (nums.some((n) => n > 0) ? nums.filter((n) => n > 0) : [0]);

/**
 * YouTube chèn sau mỗi mốc giờ một nhãn ẩn cho trình đọc màn hình ("25 minutes, 57 seconds", "25 phút 57 giây"...) và nhãn này đổi theo ngôn ngữ
 * giao diện. Nhận ra nó không dựa vào chữ: dòng ngắn có các con số trùng đúng với các phần khác 0 của mốc giờ liền trước.
 */
function isTimeLabel(row: string, stamp: RegExpMatchArray): boolean {
  if (row.length > 40) return false;
  const nums = (row.match(/\d+/g) ?? []).map(Number);
  if (nums.length === 0) return false;
  const parts = [Number(stamp[1] ?? 0), Number(stamp[2]), Number(stamp[3])];
  const want = significantNumbers(parts);
  const got = significantNumbers(nums);
  return want.length === got.length && want.every((n, i) => n === got[i]);
}

function parsePanel(rows: string[], durationSec: number | undefined): CaptionLine[] {
  const entries: { start: number; text: string }[] = [];
  let stamp: RegExpMatchArray | null = null; // mốc giờ của dòng ngay trước, còn chờ xem dòng kế có phải nhãn của nó không
  for (const row of rows) {
    if (stamp && isTimeLabel(row, stamp)) { stamp = null; continue; }
    const only = row.match(PANEL_TIME);
    stamp = only;
    if (only) { entries.push({ start: panelSeconds(only), text: "" }); continue; }
    const inline = row.match(PANEL_INLINE);
    const time = inline?.[1].match(PANEL_TIME);
    if (inline && time) { entries.push({ start: panelSeconds(time), text: inline[2] }); continue; }
    const last = entries.at(-1);
    if (last) last.text = `${last.text} ${row}`.trim();
  }
  // Thứ tự các dòng trong trang YouTube không phải lúc nào cũng theo mốc giờ (từng thấy vài dòng cuối video nằm đầu danh sách làm lệch cả bản chép):
  // bỏ bản lặp trước (lặp thì mốc giờ lùi về 0, sắp xếp sẽ trộn lẫn hai lượt), rồi sắp xếp theo mốc giờ và mới tính mốc kết thúc từ dòng kế tiếp.
  const cleaned = entries.map((e) => ({ ...e, text: clean(e.text) })).filter((e) => e.text);
  const kept = dropRepeatedPass(cleaned.map((e) => ({ ...e, end: e.start }))).length;
  const filled = cleaned.slice(0, kept).sort((a, b) => a.start - b.start);
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
