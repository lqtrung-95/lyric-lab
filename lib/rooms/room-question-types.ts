/** Một đáp án của câu hỏi: từ + thông tin phụ lấy từ phân tích của bài (đều đã có sẵn, không gọi LLM). */
export interface RoomChoice {
  term: string;
  reading: string | null;
  sinoViet: string | null;
  meaning: string;
}

/**
 * Câu hỏi Điền lời gửi cho client: KHÔNG chứa đáp án đúng (đáp án nằm ở bảng riêng `room_question_keys`).
 * Mọi trường dẫn xuất từ dòng lời đều đã bỏ phần ô trống (pinyin, ghi chú ngữ pháp).
 */
export interface RoomQuestionPublic {
  videoId: string;
  lineIndex: number;
  /** Phần lời trước và sau ô trống. */
  before: string;
  after: string;
  /** Pinyin của phần trước/sau ô trống; null khi không tách được (cách đọc không khớp). */
  pinyinBefore: string | null;
  pinyinAfter: string | null;
  /** Nghĩa tiếng Việt của cả dòng. */
  translation: string | null;
  /** Bốn đáp án đã xáo. */
  choices: RoomChoice[];
  /** Mốc đoạn nghe của dòng (giây). */
  clipStart: number;
  clipEnd: number;
  /** Mục ngữ pháp của dòng, chỉ khi không làm lộ đáp án. */
  grammarNote: { pattern: string; explanation: string } | null;
}

export interface RoomQuestionSet {
  questions: RoomQuestionPublic[];
  /** Chỉ số đáp án đúng trong `choices` của từng câu, cùng thứ tự `questions`. */
  correctIndexes: number[];
  /** Từ đúng của từng câu (để hiện sau khi trả lời và tính Hán-Việt dòng). */
  correctTerms: string[];
}
