/** Truyện ngắn của một cảnh: dùng các từ của chính cảnh đó để người học thấy từ trong ngữ cảnh. Tự viết, đơn giản; pinyin lấy từ từ điển. */
export interface SceneStory {
  title: { zh: string; vi: string };
  /** Mỗi dòng là một câu ngắn (≤ 40 ký tự để đọc được bằng giọng tạo sẵn). */
  lines: { zh: string; vi: string }[];
  /** Câu hỏi hiểu bài: hỏi bằng tiếng Việt, chọn đáp án tiếng Trung. */
  question: { vi: string; right: string; wrong: string[] };
}
