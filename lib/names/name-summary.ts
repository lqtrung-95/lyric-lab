import { z } from "zod";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { NamePart } from "./chinese-name";

/** Các chữ có nghĩa của tên (bỏ họ): chỉ những mục này được đưa cho model, KHÔNG gửi tên người dùng gõ vào (không có chỗ để chèn lệnh). */
export const meaningfulParts = (parts: readonly NamePart[]): NamePart[] => parts.filter((p) => p.role !== "surname" && p.han && p.meaning);

export const SUMMARY_SYSTEM_PROMPT = `Bạn viết lời giới thiệu ngắn cho tên tiếng Trung của một người Việt học tiếng Trung.
Nhận danh sách các chữ Hán trong tên kèm nghĩa tiếng Việt đã được duyệt. Hãy viết MỘT câu tiếng Việt (tối đa 25 từ) tóm tắt ý nghĩa chung của cả tên khi ghép lại, giọng ấm áp như lời chúc.
Quy tắc: chỉ dựa vào các nghĩa được cho, không thêm chữ Hán, không bịa ý nghĩa khác, không nhắc tên riêng, không dùng dấu ngoặc kép. Câu phải đọc tự nhiên, không liệt kê lại từng chữ.
Trả JSON: {"summary": "..."}`;

export const buildSummaryUser = (parts: readonly NamePart[]): string => meaningfulParts(parts).map((p) => `${p.han} (${p.syllable}): ${p.meaning}`).join("\n");

const outputSchema = z.object({ summary: z.string().trim().min(8).max(220) });

/** Lấy câu tóm tắt từ phản hồi JSON của model; sai dạng, quá dài hoặc có chữ Hán/ký tự lạ thì null (dùng câu dự phòng). */
export function parseSummary(raw: string): string | null {
  try {
    const r = outputSchema.safeParse(JSON.parse(raw));
    if (!r.success) return null;
    const s = r.data.summary.replace(/["“”]/g, "").replace(/\s+/g, " ").trim();
    return /\p{Script=Han}/u.test(s) || s.split(" ").length > 40 ? null : s;
  } catch {
    return null;
  }
}

/** Câu dự phòng khi không gọi được model: ghép nghĩa từng chữ, không tự nhiên bằng nhưng luôn đúng. Rỗng nếu không có chữ nào có nghĩa. */
export function fallbackSummary(parts: readonly NamePart[]): string | null {
  const m = meaningfulParts(parts).map((p) => p.meaning!);
  return m.length === 0 ? null : `Ghép lại, tên mang ý nghĩa: ${m.join(", ")}.`;
}

export async function summarizeName(parts: readonly NamePart[], chat: ChatFn, models: readonly string[]): Promise<{ text: string; ai: boolean } | null> {
  if (meaningfulParts(parts).length === 0) return null;
  for (const model of models) {
    try {
      const s = parseSummary(await chat({ model, system: SUMMARY_SYSTEM_PROMPT, user: buildSummaryUser(parts), maxTokens: 200 }));
      if (s) return { text: s, ai: true };
    } catch { /* thử model kế tiếp */ }
  }
  const f = fallbackSummary(parts);
  return f ? { text: f, ai: false } : null;
}
