import { z } from "zod";

export interface EnrichInput { term: string; pinyin: string; sinoViet: string | null; gloss: string }

export const ENRICH_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Với mỗi từ, đề xuất một emoji minh họa (chỉ khi từ chỉ vật, hành động, nơi chốn hay hiện tượng cụ thể, nhìn emoji là đoán được nghĩa) và một mẹo nhớ ngắn bằng tiếng Việt nối với âm Hán Việt ĐÃ CHO. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON.";

export function buildEnrichPrompt(items: EnrichInput[]): string {
  const lines = items.map((i) => `${i.term} | ${i.pinyin} | Hán Việt: ${i.sinoViet ?? "(không có)"} | ${i.gloss}`).join("\n");
  return `Danh sách từ (chữ giản thể | pinyin | âm Hán Việt | nghĩa tiếng Việt):
${lines}

Trả về JSON: {"items": {"<từ>": {"emoji": "<đúng một emoji hoặc chuỗi rỗng>", "tip": "<mẹo nhớ hoặc chuỗi rỗng>"}, ...}} với ĐÚNG các từ ở trên.
Quy tắc:
- emoji: MỘT emoji duy nhất, chỉ khi hình ảnh gợi đúng nghĩa; từ trừu tượng, ngữ pháp, tính chất khó hình dung thì để "".
- tip: CHỈ cho từ có từ 2 chữ Hán trở lên VÀ có âm Hán Việt ở trên; chữ đơn hoặc "(không có)" thì để "". Giải thích nghĩa ghép từ nghĩa các chữ thành phần, không chơi chữ, không đoán nghĩa theo âm tiếng Việt. Tối đa 18 từ tiếng Việt, PHẢI chứa nguyên âm Hán Việt đã cho (ví dụ 离开 "ly khai" là rời đi) rồi nối với nghĩa. TUYỆT ĐỐI không tự nghĩ ra âm Hán Việt của từng chữ hay nguồn gốc chữ; không chắc thì để "".
- Không lặp lại nguyên nghĩa tiếng Việt đã cho; không thêm pinyin.`;
}

const schema = z.object({ items: z.record(z.string(), z.object({ emoji: z.string().optional(), tip: z.string().optional() })) });
const EMOJI = /^\p{Extended_Pictographic}(?:️|‍\p{Extended_Pictographic}|\p{Emoji_Modifier})*$/u;

/** Đọc JSON model trả về; giữ emoji hợp lệ (đúng một emoji) và mẹo hợp lệ cho đúng các từ yêu cầu. `answered` là các từ model có trả lời (kể cả để trống) để biết từ nào chưa xử lý. */
export function parseEnrichment(raw: string, terms: string[], sinoViet: Record<string, string | null> = {}): { emojis: Record<string, string>; tips: Record<string, string>; answered: string[] } {
  const empty = { emojis: {}, tips: {}, answered: [] as string[] };
  let json: unknown;
  try { json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")); } catch { return empty; }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return empty;
  const emojis: Record<string, string> = {};
  const tips: Record<string, string> = {};
  const answered: string[] = [];
  for (const term of terms) {
    const item = parsed.data.items[term];
    if (!item) continue;
    answered.push(term);
    const e = item.emoji?.trim();
    if (e && EMOJI.test(e)) emojis[term] = e;
    const t = item.tip?.trim();
    // Mẹo nhớ chỉ giữ khi có âm Hán Việt thật của từ (từ từ điển) và mẹo nhắc đúng âm đó: chặn việc AI bịa âm Hán Việt.
    const sv = sinoViet[term]?.toLowerCase();
    if (t && [...term].length >= 2 && t.length >= 8 && t.length <= 160 && sv && t.toLowerCase().includes(sv)) tips[term] = t;
  }
  return { emojis, tips, answered };
}
