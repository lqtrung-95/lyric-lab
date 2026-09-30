export const EXPLAIN_LINE_SYSTEM_PROMPT =
  "Bạn là giáo viên tiếng Trung cho người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Bạn KHÔNG được viết, đoán hay sửa lời bài hát: câu đã được cung cấp sẵn.";

export interface ExplainLinePromptInput {
  line: string;
  /** Bản dịch máy đã có sẵn (nếu có) — người học cần bản giải thích tự nhiên hơn, không chỉ dịch lại. */
  lineTranslation?: string;
}

/** Prompt cho giải nghĩa cả câu: dịch tự nhiên, từ vựng đáng học, điểm ngữ pháp, và ghi chú sắc thái/ngữ cảnh. */
export function buildExplainLinePrompt({ line, lineTranslation }: ExplainLinePromptInput): string {
  return `Câu hát: ${line}${lineTranslation ? `\nBản dịch máy đã có: ${lineTranslation}` : ""}

Trả về JSON đúng cấu trúc sau:
{"translation": "...", "vocabulary": [{"term": "...", "pinyin": "...", "meaning": "..."}], "grammarPoints": [{"title": "...", "explanation": "..."}], "notes": ["..."]}

- translation: dịch tự nhiên hơn bản dịch máy ở trên (nếu có) — không chỉ dịch từng chữ, diễn đạt lại ý sao cho người học hiểu đúng sắc thái, một câu tiếng Việt trôi chảy.
- vocabulary: liệt kê MỌI từ/cụm từ đáng học trong câu (không chỉ từ khó), theo đúng thứ tự xuất hiện. Mỗi mục: term (từ tiếng Trung), pinyin (có dấu thanh), meaning (nghĩa ngắn gọn trong đúng ngữ cảnh câu này).
- grammarPoints: các cấu trúc ngữ pháp, mẫu câu hoặc cách dùng đáng chú ý trong câu này. Mảng rỗng nếu câu quá đơn giản không có gì đặc biệt.
- notes: các điểm đáng chú ý khác — sắc thái cảm xúc, ẩn ý, cách dùng đặc biệt trong ngữ cảnh bài hát. Mảng rỗng nếu không có gì thêm để nói.
- Bám sát đúng câu hát đã cho, không thêm chi tiết không có trong câu. Toàn bộ giải thích bằng tiếng Việt.`;
}
