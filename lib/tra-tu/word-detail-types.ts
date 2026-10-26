import type { WordReading } from "./types";

/** Âm Hán Việt của từng chữ trong từ (tra theo chữ phồn thể như Unihan). */
export interface CharBreakdown { hanzi: string; traditional: string; sinoViet: string[] }

/** Mọi thứ trang chi tiết cần từ từ điển (không qua LLM, trừ `aiNote`). */
export interface WordDetail {
  simplified: string;
  /** Các dạng phồn thể khác nhau của từ (từ nhiều âm có thể có nhiều dạng: 发 → 發, 髮). */
  traditionalForms: string[];
  readings: WordReading[];
  sinoViet: string | null;
  hskLevel: number | null;
  chars: CharBreakdown[];
  /** Nghĩa tiếng Việt đã duyệt (bài HSK) nếu có. */
  gloss: string | null;
}
