/** Một câu hoặc từ dùng trong đời sống: chữ Hán, pinyin có dấu thanh (viết tay, đã soát), nghĩa tiếng Việt và ghi chú cách dùng. */
export interface Phrase {
  zh: string;
  pinyin: string;
  vi: string;
  note?: string;
}

export interface PhraseGroup {
  id: string;
  title: string;
  intro?: string;
  phrases: Phrase[];
}

/** Câu hỏi trắc nghiệm ngắn: mỗi câu có 2–4 lựa chọn, một đáp án đúng và lời giải thích hiện sau khi chọn. */
export interface QuizQuestion {
  /** Nội dung hỏi (tiếng Việt hoặc chữ Hán); `zh` nếu muốn có nút nghe. */
  prompt: string;
  zh?: string;
  options: string[];
  answer: number;
  explain: string;
}
