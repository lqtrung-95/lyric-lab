import type { ExampleSentence } from "./course-types";

/** Một từ của chặng, đủ để học và ra đề mà không cần tải thêm. Pinyin/Hán Việt/cấp HSK từ từ điển; `gloss` là nghĩa tiếng Việt đã duyệt (null nếu chưa có). */
export interface UnitWord {
  term: string;
  pinyin: string;
  sinoViet: string | null;
  hskLevel: number | null;
  gloss: string | null;
  /** Nghĩa tiếng Anh từ từ điển, dùng khi chưa có gloss. */
  meanings: string[];
  examples: ExampleSentence[];
}

/** `hsk`: chặng học từ mới; `checkpoint`/`final`: chặng ôn tổng hợp (chỉ có bài kiểm tra). */
export type UnitKind = "hsk" | "checkpoint" | "final";

export interface UnitDetail {
  course: { slug: string; title: string };
  unit: { id: string; idx: number; title: string; topic: string | null; total: number; kind: UnitKind; /** Số câu của bài kiểm tra chặng. */ quizLength: number };
  words: UnitWord[];
}
