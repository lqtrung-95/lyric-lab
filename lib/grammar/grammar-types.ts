export type GrammarLevel = 1 | 2 | 3 | 4 | 5 | 6;
export const GRAMMAR_LEVELS: readonly GrammarLevel[] = [1, 2, 3, 4, 5, 6];

export interface GrammarExample {
  /** Câu tiếng Trung, các từ ngăn bằng "|" (dùng để xếp câu và điền chỗ trống; bỏ "|" là câu đọc bình thường). */
  zh: string;
  vi: string;
}

export interface GrammarMistake { wrong: string; right: string; why: string }

/** Một mẫu ngữ pháp thông dụng, nội dung tự viết (không lấy từ sách hay lời bài hát). */
export interface GrammarPattern {
  id: string;
  level: GrammarLevel;
  /** Tên ngắn, hiện ở danh sách. */
  title: string;
  /** Công thức, ví dụ "A 比 B + tính từ". */
  pattern: string;
  /** Các từ khoá tạo nên mẫu; bài điền chỗ trống che một trong số này. */
  key: string[];
  explain: string;
  /** So sánh với tiếng Việt: giống và khác chỗ nào. */
  vsVi: string;
  mistakes: GrammarMistake[];
  examples: GrammarExample[];
  /** Biểu thức chính quy (nguồn) nhận ra mẫu trong một dòng lời; bỏ trống thì không gắn nhãn tự động. */
  detect?: string;
  /** Từ khoá tìm câu thật trong kho lời bài hát/video (mặc định: key[0]). */
  term?: string;
}

export const plain = (zh: string) => zh.replaceAll("|", "");
export const segments = (zh: string) => zh.split("|").filter(Boolean);
