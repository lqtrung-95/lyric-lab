/**
 * Căn mốc mili giây của phụ đề gốc (json3 của YouTube) vào các câu ĐÃ LƯU của video: video thêm bằng cách đọc bảng "Bản chép lời" chỉ có giây nguyên
 * (câu shadowing/chép chính tả bị cụt hoặc lệch tới ~1 giây). Chỉ đổi `start`/`end`; chữ, pinyin, bản dịch và từ của câu giữ nguyên.
 * Câu đã lưu có thể là một cue, nhiều cue gộp lại, hoặc đã bỏ cue không phải lời nói, nên căn theo chữ (bỏ dấu câu/khoảng trắng) và chỉ tiến về phía trước.
 */
export interface Cue { start: number; end: number; text: string }
export interface TimedLine { text: string; start: number; end: number }

/** Giữ chữ và số (mọi ngôn ngữ), hạ chữ thường: so khớp bỏ qua dấu câu và khoảng trắng. */
export const textKey = (s: string): string => s.normalize("NFKC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");

/** Đọc json3 của YouTube thành các cue (giây, có phần lẻ). Bỏ sự kiện rỗng/chỉ xuống dòng; thiếu thời lượng thì end = start. */
export function parseJson3(raw: unknown): Cue[] {
  const events = (raw as { events?: unknown[] } | null)?.events;
  if (!Array.isArray(events)) return [];
  const out: Cue[] = [];
  for (const e of events as { tStartMs?: number; dDurationMs?: number; segs?: { utf8?: string }[] }[]) {
    if (!Array.isArray(e.segs) || typeof e.tStartMs !== "number") continue;
    const text = e.segs.map((s) => s.utf8 ?? "").join("").replace(/\s+/g, " ").trim();
    if (!text) continue;
    out.push({ start: e.tStartMs / 1000, end: (e.tStartMs + (e.dDurationMs ?? 0)) / 1000, text });
  }
  return out;
}

export interface AlignResult { lines: TimedLine[]; matched: number; total: number; ratio: number; changed: number }

const MAX_SKIP = 8;
const MAX_MERGE = 5;
/** Mốc mới lệch quá mức này so với mốc cũ thì coi là khớp nhầm, giữ mốc cũ (mốc cũ chỉ lệch tối đa ~2 giây vì làm tròn). */
const MAX_SHIFT_SEC = 4;

export function alignTimes(lines: readonly TimedLine[], cues: readonly Cue[]): AlignResult {
  const keys = cues.map((c) => textKey(c.text));
  const next: TimedLine[] = lines.map((l) => ({ ...l }));
  let j = 0;
  let matched = 0;
  lines.forEach((line, i) => {
    const want = textKey(line.text);
    if (!want) return;
    for (let skip = 0; skip <= MAX_SKIP && j + skip < cues.length; skip++) {
      let acc = "";
      for (let k = 0; k < MAX_MERGE && j + skip + k < cues.length; k++) {
        acc += keys[j + skip + k];
        if (acc === want) {
          const a = cues[j + skip], b = cues[j + skip + k];
          if (Math.abs(a.start - line.start) > MAX_SHIFT_SEC) return;
          next[i] = { ...line, start: a.start, end: Math.max(b.end, a.start) };
          j += skip + k + 1;
          matched++;
          return;
        }
        if (!want.startsWith(acc)) break;
      }
    }
  });
  // Mốc cuối của câu không được chồng sang câu kế: cắt về đầu câu kế khi vượt.
  for (let i = 0; i < next.length - 1; i++) if (next[i].end > next[i + 1].start && next[i + 1].start > next[i].start) next[i].end = next[i + 1].start;
  const changed = next.filter((l, i) => l.start !== lines[i].start || l.end !== lines[i].end).length;
  return { lines: next, matched, total: lines.length, ratio: lines.length === 0 ? 0 : matched / lines.length, changed };
}
