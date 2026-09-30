export const EXPLAIN_LINE_SYSTEM_PROMPT =
  "Bạn là giáo viên tiếng Trung cho người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Bạn KHÔNG được viết, đoán hay sửa lời bài hát: câu đã được cung cấp sẵn.";

export interface ExplainLinePromptInput {
  line: string;
  /** Bản dịch máy đã có sẵn (nếu có) — người học cần bản giải thích tự nhiên hơn, không chỉ dịch lại. */
  lineTranslation?: string;
}

/** Prompt cho giải nghĩa cả câu: nghĩa tự nhiên hơn bản dịch máy, kèm ghi chú ngữ pháp/cách dùng nếu có. */
export function buildExplainLinePrompt({ line, lineTranslation }: ExplainLinePromptInput): string {
  return `Câu hát: ${line}${lineTranslation ? `\nBản dịch máy đã có: ${lineTranslation}` : ""}

Trả về JSON: {"meaning": "...", "grammarNote": "..."}
- meaning: giải thích ý nghĩa câu này bằng tiếng Việt tự nhiên, dễ hiểu hơn bản dịch máy ở trên (nếu có) — không chỉ dịch lại từng chữ, mà diễn đạt lại ý sao cho người học hiểu đúng sắc thái, tối đa 3 câu ngắn.
- grammarNote: ghi chú ngữ pháp, cấu trúc câu hoặc cách dùng đáng chú ý trong câu này bằng tiếng Việt (không bắt buộc, bỏ trống nếu câu đơn giản không có gì đặc biệt).
- Bám sát đúng câu hát đã cho, không thêm chi tiết không có trong câu.`;
}
