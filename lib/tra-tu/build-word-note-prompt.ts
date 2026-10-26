import type { WordDetail } from "./word-detail-types";

/** Đổi khi nội dung prompt đổi theo hướng ảnh hưởng chất lượng: vô hiệu hóa mọi bản lưu đệm cũ. */
export const WORD_NOTE_PROMPT_VERSION = "w1";

export const WORD_NOTE_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Viết giải nghĩa tiếng Việt NGẮN, chính xác cho MỘT từ tiếng Trung, bám theo dữ liệu từ điển được cung cấp. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON.";

/** Prompt giải nghĩa từ (không theo ngữ cảnh). Pinyin, Hán Việt, cấp HSK đưa vào làm dữ kiện, KHÔNG nhờ model tạo ra. */
export function buildWordNotePrompt(w: WordDetail): string {
  const readings = w.readings.slice(0, 4).map((r) => `- ${r.pinyin}: ${r.meanings.slice(0, 6).join("; ")}`).join("\n");
  const facts = [
    `Từ: ${w.simplified}`,
    w.sinoViet && `Hán Việt: ${w.sinoViet}`,
    w.hskLevel != null && `Cấp HSK: ${w.hskLevel}`,
    w.gloss && `Nghĩa tiếng Việt đã duyệt: ${w.gloss}`,
  ].filter(Boolean).join("\n");
  return `${facts}
Các cách đọc và nghĩa tiếng Anh (CC-CEDICT):
${readings}

Trả về JSON: {"gloss": "<nghĩa gọn nhất>", "senses": [{"pos": "<loại từ>", "meaning": "<nghĩa>", "usage": "<cách dùng ngắn>"}], "note": "<lưu ý nếu cần>"}
Quy tắc:
- "gloss" tối đa 8 từ tiếng Việt, là nghĩa THÔNG DỤNG NHẤT trong tiếng Trung hiện đại.
- "senses": 1–4 nghĩa chính, xếp từ phổ biến đến ít gặp; bỏ nghĩa cổ/hiếm/họ người. "pos" là loại từ bằng tiếng Việt (danh từ, động từ, tính từ, trạng từ, trợ từ, lượng từ…); bỏ qua "pos"/"usage" nếu không chắc.
- Chỉ dựa vào dữ liệu trên; không bịa nghĩa. Nếu có "Nghĩa tiếng Việt đã duyệt" thì giữ ý đó cho "gloss".
- KHÔNG viết chữ Hán, pinyin hay ví dụ tiếng Trung trong câu trả lời; viết thuần tiếng Việt.
- "note" (tùy chọn): sắc thái, khác biệt với từ gần nghĩa, hoặc lỗi hay gặp của người Việt.`;
}
