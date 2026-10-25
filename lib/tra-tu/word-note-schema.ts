import { z } from "zod";

// Không cho chữ Hán trong lời giải thích của AI: pinyin, Hán Việt và ví dụ tiếng Trung chỉ lấy từ từ điển / kho câu thật (quy tắc sản phẩm).
const noHan = (s: string) => !/\p{Script=Han}/u.test(s);
const vi = (max: number) => z.string().trim().min(1).max(max).refine(noHan, "không chứa chữ Hán");

/** Giải nghĩa tiếng Việt cho cả từ (không theo ngữ cảnh câu): nghĩa gọn + các nghĩa chính kèm loại từ và cách dùng. */
export const wordMeaningNoteSchema = z.object({
  gloss: vi(80),
  senses: z.array(z.object({ pos: vi(24).optional(), meaning: vi(160), usage: vi(200).optional() })).min(1).max(4),
  note: vi(240).optional(),
});
export type WordMeaningNote = z.infer<typeof wordMeaningNoteSchema>;

/** Một bản lưu đệm: nội dung + model đã viết (để minh bạch với người dùng). */
export interface StoredWordNote { note: WordMeaningNote; model: string }
