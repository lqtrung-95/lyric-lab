/** Kết quả một câu của bài kiểm tra: đúng hay sai, và các từ làm đúng/sai (để thêm vào bộ ôn). Mọi dạng câu hỏi báo về cùng một dạng này. */
export interface QuizResult {
  correct: boolean;
  right: string[];
  wrong: string[];
}
