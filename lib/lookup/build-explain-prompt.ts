export const EXPLAIN_SYSTEM_PROMPT =
  "Bạn là giáo viên tiếng Trung cho người Việt. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON. " +
  "Bạn KHÔNG được viết, đoán hay sửa lời bài hát: câu đã được cung cấp sẵn.";

export interface ExplainPromptInput {
  term: string;
  line: string;
  lineTranslation?: string;
  /** Nghĩa tiếng Anh từ từ điển (CC-CEDICT) để bám vào, tránh bịa. */
  dictionaryMeanings: string[];
  /** Mặc định là lời bài hát. */
  lineKind?: "lyric" | "speech";
}

/** Prompt ngắn cho một từ: giải nghĩa theo đúng ngữ cảnh câu hát bằng tiếng Việt. */
export function buildExplainPrompt({ term, line, lineTranslation, dictionaryMeanings, lineKind = "lyric" }: ExplainPromptInput): string {
  const noun = lineKind === "speech" ? "Câu nói" : "Câu hát";
  const dictionary = dictionaryMeanings.length ? dictionaryMeanings.join("; ") : "(không có trong từ điển)";
  return `${noun}: ${line}${lineTranslation ? `\nBản dịch câu: ${lineTranslation}` : ""}
Từ cần giải nghĩa: ${term}
Nghĩa tiếng Anh trong từ điển: ${dictionary}

Trả về JSON: {"meaningInContext": "...", "note": "..."}
- meaningInContext: nghĩa của từ trong ĐÚNG ${noun.toLowerCase()} này, tiếng Việt, tối đa 2 câu ngắn. Bám vào nghĩa từ điển ở trên; không trích nguyên ${noun.toLowerCase()}. TUYỆT ĐỐI KHÔNG nhắc lại từ gốc (chữ Hán) trong nội dung này vì nó được dùng làm gợi ý cho bài tập; mở đầu thẳng bằng nghĩa, ví dụ: "Ở câu này mang nghĩa là “đã mất” hoặc “không còn có”. Trong ngữ cảnh, nó diễn tả…".
- note: ghi chú ngữ pháp hoặc cách dùng ngắn gọn bằng tiếng Việt (không bắt buộc, bỏ trống nếu không cần).
- KHÔNG ghi pinyin, cấp HSK hay âm Hán Việt (hệ thống tự tra từ điển).`;
}
