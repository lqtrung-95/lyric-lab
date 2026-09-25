export const EXPLAIN_SYSTEM_PROMPT =
  "Bạn là giáo viên tiếng Trung cho người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Bạn KHÔNG được viết, đoán hay sửa lời bài hát: câu đã được cung cấp sẵn.";

export interface ExplainPromptInput {
  term: string;
  line: string;
  lineTranslation?: string;
  /** Nghĩa tiếng Anh từ từ điển (CC-CEDICT) để bám vào, tránh bịa. */
  dictionaryMeanings: string[];
}

/** Prompt ngắn cho một từ: giải nghĩa theo đúng ngữ cảnh câu hát bằng tiếng Việt. */
export function buildExplainPrompt({ term, line, lineTranslation, dictionaryMeanings }: ExplainPromptInput): string {
  const dictionary = dictionaryMeanings.length ? dictionaryMeanings.join("; ") : "(không có trong từ điển)";
  return `Câu hát: ${line}${lineTranslation ? `\nBản dịch câu: ${lineTranslation}` : ""}
Từ cần giải nghĩa: ${term}
Nghĩa tiếng Anh trong từ điển: ${dictionary}

Trả về JSON: {"meaningInContext": "...", "note": "..."}
- meaningInContext: nghĩa của từ trong ĐÚNG câu hát này, tiếng Việt, tối đa 2 câu ngắn. Bám vào nghĩa từ điển ở trên; không trích nguyên câu hát.
- note: ghi chú ngữ pháp hoặc cách dùng ngắn gọn bằng tiếng Việt (không bắt buộc, bỏ trống nếu không cần).
- KHÔNG ghi pinyin, cấp HSK hay âm Hán Việt (hệ thống tự tra từ điển).`;
}
