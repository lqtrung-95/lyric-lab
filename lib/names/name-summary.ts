import { z } from "zod";
import type { ChatFn } from "@/lib/analysis/groq-chat";
import type { NamePart } from "./chinese-name";

/** Các chữ có nghĩa của tên (bỏ họ): chỉ những mục này được đưa cho model, KHÔNG gửi tên người dùng gõ vào (không có chỗ để chèn lệnh). */
export const meaningfulParts = (parts: readonly NamePart[]): NamePart[] => parts.filter((p) => p.role !== "surname" && p.han && p.meaning && p.meaning !== "họ");

export const SUMMARY_SYSTEM_PROMPT = `Bạn là người bạn sành tiếng Trung, viết lời giải nghĩa cho tên tiếng Trung của một người Việt đang học tiếng Trung.
Bạn nhận các chữ Hán trong tên kèm nghĩa tiếng Việt đã được duyệt. Hãy viết 1 đến 2 câu tiếng Việt, tổng cộng tối đa 30 từ: gom các nghĩa thành MỘT hình ảnh hoặc MỘT lời chúc liền mạch, như đang nói thẳng với người mang tên (xưng "bạn" hoặc để chủ ngữ ẩn).
Cách viết:
- Mở bằng một hình ảnh, một động từ hoặc một lời chúc (như "Như một…", "Mong bạn…", "Trong trẻo như…", "Vừa… vừa…"). TUYỆT ĐỐI không mở bằng "Một cái tên", "Cái tên", "Tên bạn", "Tên của bạn", "Tên này"; không dùng cụm "mang ý nghĩa" hay "có nghĩa là".
- Nối các nghĩa thành một ý duyên dáng, không liệt kê lại từng chữ, không chép nguyên danh sách nghĩa.
- Giọng ấm, tự nhiên như người Việt nói chuyện, tránh sáo rỗng.
- Chỉ dựa vào các nghĩa được cho: diễn đạt lại bằng hình ảnh nhưng TUYỆT ĐỐI không thêm phẩm chất hay ý mới (không tự thêm "tràn đầy sức sống", "tỏa sáng", "rạng ngời"… nếu nghĩa không có). Không thêm chữ Hán, không nhắc tên riêng, không dùng ngoặc kép.
- Độ dài vừa đủ với lượng nghĩa: ít nghĩa thì chỉ một câu ngắn, đừng kéo dài bằng ý thêm.
Ví dụ về giọng văn (nghĩa khác, chỉ để học cách viết):
- Nghĩa "trong sáng; mùa xuân" → {"summary": "Trong trẻo như một sớm xuân."}
- Nghĩa "cây trúc; ngọc quý" → {"summary": "Bền như trúc, quý như ngọc."}
- Nghĩa "hạnh phúc" → {"summary": "Mong bạn luôn hạnh phúc."}
Trả JSON: {"summary": "..."}`;

export const buildSummaryUser = (parts: readonly NamePart[]): string => meaningfulParts(parts).map((p) => `${p.han} (${p.syllable}): ${p.meaning}`).join("\n");

/** Câu mở đầu và cụm sáo mòn bị cấm (model hay quay về lối "Một cái tên mang ý nghĩa…"): gặp thì bỏ để thử model kế. */
const BANNED = /^(một cái tên|cái tên|tên (của )?bạn|tên này)\b|mang ý nghĩa|có nghĩa là/i;

const outputSchema = z.object({ summary: z.string().trim().min(8).max(220) });

/** Lấy câu tóm tắt từ phản hồi JSON của model; sai dạng, quá dài hoặc có chữ Hán/ký tự lạ thì null (dùng câu dự phòng). */
export function parseSummary(raw: string): string | null {
  try {
    const r = outputSchema.safeParse(JSON.parse(raw));
    if (!r.success) return null;
    const s = r.data.summary.replace(/["“”]/g, "").replace(/\s+/g, " ").trim();
    return /\p{Script=Han}/u.test(s) || s.split(" ").length > 40 || BANNED.test(s) ? null : s;
  } catch {
    return null;
  }
}

/**
 * Câu dự phòng khi không gọi được model: chỉ liệt kê nghĩa từng chữ, cách nhau bằng dấu chấm giữa, viết hoa chữ đầu ("Ngọc quý · biển cả · tinh anh, tài giỏi").
 * Không ghép thành câu có khung ("ghép lại thành…", "mang ý nghĩa…") vì nghĩa có thể là danh từ hay tính từ nên khung nào cũng dễ gượng. Rỗng nếu không có chữ nào có nghĩa.
 */
export function fallbackSummary(parts: readonly NamePart[]): string | null {
  const m = meaningfulParts(parts).map((p) => p.meaning!);
  if (m.length === 0) return null;
  const list = m.join(" · ");
  return `${list.charAt(0).toLocaleUpperCase("vi")}${list.slice(1)}`;
}

export async function summarizeName(parts: readonly NamePart[], chat: ChatFn, models: readonly string[], onError?: (model: string, message: string) => void): Promise<{ text: string; ai: boolean; model?: string } | null> {
  if (meaningfulParts(parts).length === 0) return null;
  for (const model of models) {
    try {
      const s = parseSummary(await chat({ model, system: SUMMARY_SYSTEM_PROMPT, user: buildSummaryUser(parts), maxTokens: 200 }));
      if (s) return { text: s, ai: true, model };
      onError?.(model, "câu bị loại (sai dạng hoặc dùng lối cấm)");
    } catch (e) { onError?.(model, e instanceof Error ? e.message : String(e)); /* thử model kế tiếp */ }
  }
  const f = fallbackSummary(parts);
  return f ? { text: f, ai: false } : null;
}
