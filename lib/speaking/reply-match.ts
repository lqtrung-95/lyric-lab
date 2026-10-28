// Đối chiếu câu người học nói (kết quả nhận diện giọng) với câu trả lời mẫu của hội thoại. Câu hỏi mở nên không đòi giống hệt:
// "đã đáp" khi nói được tiếng Trung có nghĩa, "khớp ý" khi có đủ chữ nội dung trùng với câu mẫu.

const HAN = /\p{Script=Han}/u;

/** Chữ hư/đại từ quá phổ biến: có trong câu nào cũng vậy nên không dùng để kết luận là đúng ý. */
const FILLER = new Set([..."的了是我你他她它们吗呢吧啊呀嘛哦不也都就还很在有和与这那个一"]);

export const hanChars = (text: string): string[] => [...text].filter((c) => HAN.test(c));

const contentChars = (text: string): string[] => [...new Set(hanChars(text).filter((c) => !FILLER.has(c)))];

/** Mệnh đề đầu của câu mẫu (trước dấu ngắt câu đầu tiên): câu mẫu dài thường chèn thêm ý phụ mà người học không cần nói lại. */
const firstClause = (text: string): string => text.split(/[。！？!?；;，,]/).find((p) => hanChars(p).length > 0) ?? text;

export type ReplyVerdict = "silent" | "answered" | "matched";

export interface ReplyJudgement {
  verdict: ReplyVerdict;
  /** Tỉ lệ chữ nội dung của câu mẫu có trong câu nói (0..1). */
  overlap: number;
}

const MIN_HAN_TO_COUNT = 2;
const MATCH_AT = 0.3;

/**
 * Chấm một câu đáp. "silent": gần như không nói gì (dưới 2 chữ Hán); "answered": đã nói; "matched": đã nói và trùng ít nhất 1/3 chữ nội dung của câu mẫu
 * ở mệnh đề đầu của câu mẫu (chỉ có chữ hư thì coi như khớp khi đã nói, vì không có gì để so). Đây là so từ khóa chứ không hiểu nghĩa, nên giao diện gọi là "có từ khóa giống câu mẫu".
 */
export function judgeReply(transcript: string, model: string): ReplyJudgement {
  if (hanChars(transcript).length < MIN_HAN_TO_COUNT) return { verdict: "silent", overlap: 0 };
  const want = contentChars(firstClause(model));
  if (want.length === 0) return { verdict: "matched", overlap: 1 };
  const said = new Set(hanChars(transcript));
  const overlap = want.filter((c) => said.has(c)).length / want.length;
  return { verdict: overlap >= MATCH_AT ? "matched" : "answered", overlap };
}

/** Điểm một câu Hỏi nhanh: 0 nếu im lặng/quá giờ, 60 nếu đã đáp, 100 nếu khớp ý. Dưới trần 150/câu của máy chủ. */
export const reflexPoints = (verdict: ReplyVerdict): number => (verdict === "matched" ? 100 : verdict === "answered" ? 60 : 0);

/** Từ nào trong danh sách đã được dùng trong câu nói (khớp nguyên cụm chữ Hán). */
export const wordsUsed = (transcript: string, words: readonly string[]): string[] => words.filter((w) => w && transcript.includes(w));
