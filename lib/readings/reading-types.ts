import type { LevelBand } from "@/lib/dialogues/dialogue-types";

export interface ReadingSentence { zh: string; vi: string }
export interface ReadingQuestion { q: string; options: [string, string, string]; /** Chỉ số đáp án đúng trong `options`. */ answer: 0 | 1 | 2 }

/** Truyện ngắn tự viết (không lấy từ nguồn có bản quyền). Pinyin và cấp HSK không viết tay mà lấy từ từ điển. */
export interface ReadingDef {
  id: string;
  title: { zh: string; vi: string };
  emoji: string;
  sentences: ReadingSentence[];
  quiz: ReadingQuestion[];
}

export interface ReadingSummary { id: string; title: { zh: string; vi: string }; emoji: string; sentenceCount: number; level: LevelBand | null }
