import { z } from "zod";

export interface GlossInput { term: string; pinyin: string; meanings: string[] }

export const GLOSS_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Nhiệm vụ: viết nghĩa tiếng Việt NGẮN, tự nhiên cho từng từ HSK. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào ngoài JSON.";

export function buildGlossPrompt(items: GlossInput[]): string {
  const lines = items.map((i) => `${i.term} | ${i.pinyin} | ${i.meanings.slice(0, 4).join("; ")}`).join("\n");
  return `Danh sách từ (chữ giản thể | pinyin | nghĩa tiếng Anh từ từ điển CC-CEDICT):
${lines}

Trả về JSON: {"glosses": {"<từ>": "<nghĩa tiếng Việt>", ...}} với ĐÚNG các từ ở trên.
Quy tắc:
- Mỗi nghĩa tối đa 6 từ tiếng Việt, ưu tiên nghĩa THÔNG DỤNG NHẤT trong tiếng Trung hiện đại (người học HSK), bỏ nghĩa cổ/hiếm/nghĩa họ người.
- Từ ngữ pháp (trợ từ, giới từ, lượng từ) ghi loại từ trong ngoặc rồi nghĩa/cách dùng ngắn, ví dụ "(trợ từ) đã, rồi", "(lượng từ) cái".
- Từ nhiều nghĩa: tối đa hai nghĩa phổ biến, ngăn bằng dấu phẩy.
- Không dịch máy móc từng chữ; không thêm pinyin hay chữ Hán vào nghĩa.`;
}

const schema = z.object({ glosses: z.record(z.string(), z.string()) });

/** Đọc JSON model trả về; trả các nghĩa hợp lệ cho đúng những từ yêu cầu (bỏ từ thừa, từ trống, nghĩa quá dài). `missing` là các từ chưa có nghĩa dùng được. */
export function parseGlosses(raw: string, terms: string[]): { glosses: Record<string, string>; missing: string[] } {
  let json: unknown;
  try { json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")); } catch { return { glosses: {}, missing: [...terms] }; }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { glosses: {}, missing: [...terms] };
  const glosses: Record<string, string> = {};
  for (const term of terms) {
    const g = parsed.data.glosses[term]?.trim();
    if (g && g.length <= 80) glosses[term] = g;
  }
  return { glosses, missing: terms.filter((t) => !(t in glosses)) };
}
