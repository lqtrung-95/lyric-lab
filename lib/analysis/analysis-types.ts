import type { NormalizedLyricLine } from "@/lib/lyrics/lyrics-types";

export interface LyricToken {
  /** Bản gốc để hiển thị (có thể là phồn thể). */
  text: string;
  /** Giản thể, dùng để tra từ điển. */
  simplified: string;
  isHan: boolean;
}

export interface TokenizedLine extends NormalizedLyricLine {
  tokens: LyricToken[];
}

export interface VocabOccurrence {
  lineIndex: number;
  /** Thời điểm bắt đầu của dòng chứa từ (giây). */
  start: number;
}

/** Từ ứng viên (đã tra từ điển) để đưa cho LLM chọn. */
export interface VocabCandidate {
  term: string;
  traditional: string;
  pinyin: string;
  hskLevel: number | null;
  meanings: string[];
  occurrences: VocabOccurrence[];
}

export type LyricsSourceLabel = "youtube_caption" | "lrclib";

/**
 * Mục xem trước (PRD §8.2). `level` là cấp HSK 3.0 lấy từ từ điển (1–6, 7 = nhóm 7–9); từ ngoài HSK là null.
 * Với ngữ pháp, `level` là ước lượng của LLM (không có từ điển cho ngữ pháp).
 */
export interface PreviewItem {
  id: string;
  type: "vocab" | "grammar";
  term: string;
  reading?: string;
  sinoViet?: string;
  level: number | null;
  meaningInContext: string;
  explanation?: string;
  example?: { zh: string; vi: string };
  commonMistake?: string;
  occurrences: VocabOccurrence[];
  priority: number;
}

export interface AnalyzedLine {
  index: number;
  text: string;
  start: number;
  end: number;
  pinyin: string;
  translation?: string;
  tokens: { text: string; itemId?: string }[];
}

export interface SongAnalysis {
  videoId: string;
  /** Tên bài và nghệ sĩ sạch, nếu nguồn lời cung cấp (LRCLIB). */
  track?: { title: string; artist: string };
  lyricsSource: LyricsSourceLabel;
  summary: string;
  moods: string[];
  lines: AnalyzedLine[];
  items: PreviewItem[];
  promptVersion: string;
  model: string;
}
