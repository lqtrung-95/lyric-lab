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
