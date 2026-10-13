// Kiểu và hàm dùng chung cho cả máy chủ và trình duyệt (không kéo jieba vào bundle client).

/** Một từ của kết quả. Token không phải chữ Hán (dấu câu, số, chữ Latin) giữ nguyên, không có pinyin và Hán Việt. */
export interface ConvertedToken {
  text: string;
  pinyin: string | null;
  sinoViet: string | null;
}

export interface ConvertedLine {
  tokens: ConvertedToken[];
}

/** Số chữ tối đa mỗi lần chuyển: đủ cho một đoạn văn, đủ nhỏ để một lần tra từ điển. */
export const MAX_CONVERT_CHARS = 600;
/** Gộp một trường của mọi token thành chuỗi để sao chép: mỗi dòng một dòng, dấu câu giữ nguyên, token thiếu giá trị thì dùng chính chữ gốc. */
export function joinField(lines: ConvertedLine[], field: "pinyin" | "sinoViet"): string {
  return lines.map((l) => l.tokens.map((t) => t[field] ?? t.text).join(" ")).join("\n");
}
