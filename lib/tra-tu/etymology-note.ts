import { z } from "zod";
import type { EtymologyNote, HanziInfoView } from "./hanzi-info-types";
import { ETYMOLOGY_LABEL } from "./hanzi-structure";

/** Đổi khi nội dung prompt chiết tự đổi theo hướng ảnh hưởng chất lượng: vô hiệu hóa mọi bản lưu đệm cũ. */
export const ETYMOLOGY_PROMPT_VERSION = "e1";

export const ETYMOLOGY_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Giải thích NGẮN GỌN cách một chữ Hán được cấu tạo, chỉ dựa trên dữ kiện được cung cấp. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON.";

/** Các chữ Hán được phép xuất hiện trong lời AI: chữ đang xét và các thành phần trong dữ kiện. */
export function allowedHan(info: HanziInfoView): Set<string> {
  const e = info.etymology;
  return new Set([info.hanzi, info.radical.char, ...info.components.map((c) => c.char), ...(e?.phonetic ? [e.phonetic.char] : []), ...(e?.semantic ? [e.semantic.char] : [])]);
}

export function etymologyNoteSchema(allowed: ReadonlySet<string>) {
  const text = (max: number) => z.string().trim().min(1).max(max).refine((s) => [...s].every((c) => !/\p{Script=Han}/u.test(c) || allowed.has(c)), "chữ Hán ngoài dữ kiện");
  return z.object({ story: text(400), mnemonic: text(200).optional() });
}

const ref = (c: { char: string; sinoViet: string | null }) => (c.sinoViet ? `${c.char} (Hán Việt: ${c.sinoViet})` : c.char);

export function buildEtymologyPrompt(info: HanziInfoView): string {
  const e = info.etymology;
  const facts = [
    `Chữ: ${info.hanzi}${info.sinoViet.length ? ` (Hán Việt: ${info.sinoViet.join(", ")})` : ""}`,
    info.definition && `Nghĩa tiếng Anh: ${info.definition}`,
    `Bộ thủ: ${ref(info.radical)}`,
    info.layoutLabel && `Cấu tạo: ${info.layoutLabel}`,
    info.components.length > 0 && `Thành phần: ${info.components.map(ref).join(", ")}`,
    e && `Loại chữ: ${ETYMOLOGY_LABEL[e.type].name}`,
    e?.hint && `Gợi ý nguồn gốc (tiếng Anh): ${e.hint}`,
    e?.phonetic && `Phần chỉ âm: ${ref(e.phonetic)}`,
    e?.semantic && `Phần chỉ nghĩa: ${ref(e.semantic)}`,
  ].filter(Boolean).join("\n");
  return `${facts}

Trả về JSON: {"story": "<cách chữ được dựng, 1–3 câu>", "mnemonic": "<mẹo nhớ ngắn, tùy chọn>"}
Quy tắc:
- Viết bằng tiếng Việt, chỉ dựa vào dữ kiện trên; nếu dữ kiện không đủ để giải thích chắc chắn thì nói ngắn gọn và đừng suy đoán nguồn gốc cổ.
- Chỉ nhắc tới các chữ Hán có trong dữ kiện; KHÔNG viết pinyin và KHÔNG tự thêm âm Hán Việt ngoài dữ kiện.
- "mnemonic" gắn nghĩa với các thành phần (có thể dùng âm Hán Việt đã cho) để dễ nhớ; bỏ qua nếu không có cách nhớ hợp lý.`;
}

export type { EtymologyNote };
