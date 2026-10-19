import { pickDiverse, scoreSentence, type ScoredLine } from "./score-sentence";

export interface VideoLines {
  videoId: string;
  lines: { idx: number; text: string; translation: string | null; tokens: { text: string }[] }[];
}

export interface TermSentenceRow { term: string; video_id: string; line_idx: number; quality: number }

export interface BuildStats {
  /** Số từ theo cấp, số từ có ít nhất 1 / 3 câu sau khi chấm điểm. */
  byLevel: Record<number, { words: number; atLeast1: number; atLeast3: number }>;
  rows: number;
}

/** Điểm tối thiểu để một câu được giữ làm câu ví dụ (dưới mức này coi như không đủ tốt). */
export const MIN_QUALITY = 50;
export const DEFAULT_PER_TERM = 5;

/**
 * Xây chỉ mục từ↔câu: với mỗi từ HSK (`levels`: từ → cấp), chấm điểm mọi dòng video có từ đó như một token, giữ tối đa `perTerm` câu tốt nhất
 * (đa dạng video). Thuần túy, không đụng DB, nên chạy lại được và test được.
 */
export function buildTermSentences(videos: VideoLines[], levels: Map<string, number>, perTerm = DEFAULT_PER_TERM): { rows: TermSentenceRow[]; stats: BuildStats } {
  const levelOf = (w: string) => levels.get(w);
  const byTerm = new Map<string, ScoredLine[]>();
  const seenVideos = new Set<string>();
  for (const v of videos) {
    if (seenVideos.has(v.videoId)) continue; // phòng đầu vào lặp video: khóa chính (từ, video, dòng) không cho trùng
    seenVideos.add(v.videoId);
    for (const line of v.lines) {
      const seen = new Set<string>();
      for (const tok of line.tokens) {
        const termLevel = levels.get(tok.text);
        if (termLevel === undefined || seen.has(tok.text)) continue;
        seen.add(tok.text);
        const quality = scoreSentence(line, { term: tok.text, termLevel, levelOf });
        if (quality === null || quality < MIN_QUALITY) continue;
        (byTerm.get(tok.text) ?? byTerm.set(tok.text, []).get(tok.text)!).push({ videoId: v.videoId, lineIdx: line.idx, quality });
      }
    }
  }
  const rows: TermSentenceRow[] = [];
  const counts = new Map<string, number>();
  for (const [term, lines] of byTerm) {
    const picked = pickDiverse(lines, perTerm);
    counts.set(term, picked.length);
    for (const p of picked) rows.push({ term, video_id: p.videoId, line_idx: p.lineIdx, quality: p.quality });
  }
  const byLevel: BuildStats["byLevel"] = {};
  for (const [term, level] of levels) {
    const entry = (byLevel[level] ??= { words: 0, atLeast1: 0, atLeast3: 0 });
    entry.words++;
    const n = counts.get(term) ?? 0;
    if (n >= 1) entry.atLeast1++;
    if (n >= 3) entry.atLeast3++;
  }
  return { rows, stats: { byLevel, rows: rows.length } };
}
