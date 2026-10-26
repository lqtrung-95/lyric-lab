/** Một cách đọc của một từ (một dòng CC-CEDICT). */
export interface WordReading {
  pinyin: string;
  meanings: string[];
  hskLevel: number | null;
  /** Hạng tần suất (nhỏ = thường gặp); null nếu không có. */
  frequency: number | null;
}

/** Cách khớp, theo độ tin cậy giảm dần; dùng để xếp hạng và hiện nhãn "khớp theo …". */
export type MatchKind = "exact" | "han-prefix" | "pinyin" | "sino-viet" | "vi-gloss" | "english" | "han-contains";

/** Kết quả tra: một từ (đã gộp các cách đọc). `simplified` là khóa của trang chi tiết. */
export interface WordResult {
  simplified: string;
  traditional: string;
  readings: WordReading[];
  sinoViet: string | null;
  /** Nghĩa tiếng Việt đã duyệt (bài học HSK) nếu có. */
  gloss: string | null;
  hskLevel: number | null;
  match: MatchKind;
  score: number;
}
