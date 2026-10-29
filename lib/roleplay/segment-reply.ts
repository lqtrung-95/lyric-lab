import { tokenizeLyricLines } from "@/lib/analysis/tokenize-lyric-lines";
import { normalizeLyricLines } from "@/lib/lyrics/normalize-lyric-lines";

export interface ReplyToken { text: string; han: boolean }

/**
 * Tách câu đáp của AI thành từ (jieba, cùng đường ống với lời bài hát) để giao diện cho bấm từng từ tra nghĩa/lưu thẻ.
 * Ghép lại các token phải đúng bằng câu gốc (chuẩn hóa có thể đổi chữ/độ dài); không khớp thì trả [] và giao diện hiện câu thường, không bấm được.
 */
export function segmentReply(text: string): ReplyToken[] {
  try {
    const [line] = tokenizeLyricLines(normalizeLyricLines([{ text, start: 0, end: 1 }]));
    const tokens = (line?.tokens ?? []).map((t) => ({ text: t.text, han: t.isHan }));
    return tokens.map((t) => t.text).join("") === text ? tokens : [];
  } catch {
    return [];
  }
}
