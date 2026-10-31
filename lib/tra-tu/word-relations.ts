import { z } from "zod";
import type { WordDetail } from "./word-detail-types";

/** Đổi khi prompt đổi theo hướng ảnh hưởng chất lượng: vô hiệu hóa mọi bản lưu đệm cũ. */
export const WORD_RELATIONS_PROMPT_VERSION = "r1";

export const WORD_RELATIONS_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Liệt kê từ đồng nghĩa và trái nghĩa phổ biến của MỘT từ tiếng Trung. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON.";

/** Kết quả thô của model: chỉ danh sách từ Hán (giản thể). Pinyin và nghĩa sẽ lấy từ từ điển sau khi lọc, không do model tạo ra. */
export const rawRelationsSchema = z.object({
  synonyms: z.array(z.string().trim().min(1).max(8)).max(10).default([]),
  antonyms: z.array(z.string().trim().min(1).max(8)).max(10).default([]),
});
export type RawRelations = z.infer<typeof rawRelationsSchema>;

export interface RelatedWord { term: string; pinyin: string; meaning: string | null }
export interface WordRelations { synonyms: RelatedWord[]; antonyms: RelatedWord[] }

/** Prompt tìm từ liên quan: nghĩa đưa vào làm dữ kiện để model chọn đúng nghĩa thông dụng nhất. */
export function buildWordRelationsPrompt(w: WordDetail): string {
  const readings = w.readings.slice(0, 3).map((r) => `- ${r.pinyin}: ${r.meanings.slice(0, 5).join("; ")}`).join("\n");
  return `Từ: ${w.simplified}${w.gloss ? `\nNghĩa tiếng Việt: ${w.gloss}` : ""}
Nghĩa tiếng Anh (CC-CEDICT):
${readings}

Trả về JSON: {"synonyms": ["<từ>", ...], "antonyms": ["<từ>", ...]}
Quy tắc:
- Chỉ chữ Hán GIẢN THỂ, mỗi phần tử là MỘT từ (1–4 chữ), không pinyin, không giải thích.
- "synonyms": 2–5 từ đồng nghĩa hoặc gần nghĩa phổ biến theo nghĩa thông dụng nhất của từ; không lặp lại chính từ đang xét.
- "antonyms": 0–4 từ trái nghĩa thực sự; trả [] nếu từ không có trái nghĩa rõ ràng (đừng gượng ép).
- Chỉ dùng từ có thật trong tiếng Trung hiện đại; ưu tiên từ thuộc HSK.`;
}

const HAN_WORD = /^\p{Script=Han}{1,8}$/u;

/** Làm sạch danh sách từ của model: bỏ trùng, chữ không phải Hán, chính từ đang xét; một từ không được vừa đồng nghĩa vừa trái nghĩa. Giữ thứ tự. */
export function cleanRelationWords(raw: RawRelations, self: string): { synonyms: string[]; antonyms: string[] } {
  const seen = new Set([self]);
  const take = (list: string[]) => list.filter((w) => HAN_WORD.test(w) && !seen.has(w) && (seen.add(w), true));
  const synonyms = take(raw.synonyms);
  const antonyms = take(raw.antonyms);
  return { synonyms, antonyms };
}

/** Giới hạn số từ hiển thị mỗi nhóm. */
export const MAX_SYNONYMS = 5;
export const MAX_ANTONYMS = 4;
