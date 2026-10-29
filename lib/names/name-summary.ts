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

/** Khung câu dự phòng (không phụ thuộc loại từ của nghĩa: danh từ hay tính từ đều đọc được), chọn cố định theo nội dung để cùng tên luôn ra cùng câu. */
const FALLBACK_FRAMES: readonly ((list: string) => string)[] = [
  (l) => `Gửi gắm trong tên là ${l}.`,
  (l) => `Mỗi chữ một lời chúc: ${l}.`,
  (l) => `Ghép lại thành ${l}, nghe thật đẹp.`,
  (l) => `${l[0].toUpperCase()}${l.slice(1)}: những điều đẹp được gửi vào tên bạn.`,
];

/** Câu dự phòng khi không gọi được model: ghép nghĩa từng chữ vào một khung câu (không mở bằng "Một cái tên…"). Rỗng nếu không có chữ nào có nghĩa. */
export function fallbackSummary(parts: readonly NamePart[]): string | null {
  const m = meaningfulParts(parts).map((p) => p.meaning!);
  if (m.length === 0) return null;
  const list = m.length === 1 ? m[0] : `${m.slice(0, -1).join(", ")} và ${m[m.length - 1]}`;
  const seed = [...list].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
  return FALLBACK_FRAMES[seed % FALLBACK_FRAMES.length](list);
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
