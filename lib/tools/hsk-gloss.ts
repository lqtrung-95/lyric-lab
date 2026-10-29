import { z } from "zod";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";

/** Một cách đọc ứng viên của từ (lấy từ từ điển): pinyin và vài nghĩa tiếng Anh đầu. */
export interface ReadingCandidate { pinyin: string; meanings: string[] }
export interface HskGlossInput { term: string; candidates: ReadingCandidate[] }

const MAX_CANDIDATES = 4;
const MAX_MEANINGS_SHOWN = 3;
const NOT_REAL = /^(old |archaic |erhua |japanese |korean )?(variant|see |used in )/i;
const SURNAME = /^[A-ZÀ-Ỹ]/;

/**
 * Các cách đọc ứng viên của một từ từ MỌI mục từ điển của nó: bỏ mục biến thể và họ người (nếu còn mục khác), gộp mục trùng pinyin, tối đa 4 cách.
 * Pinyin luôn là pinyin của từ điển; AI chỉ chọn trong số này (quy tắc dự án: pinyin không do LLM tạo ra).
 */
export function readingCandidates(entries: DictWordRow[]): ReadingCandidate[] {
  const real = entries.filter((e) => !NOT_REAL.test(e.meanings[0] ?? ""));
  const pool = real.length > 0 ? real : entries;
  const common = pool.filter((e) => !SURNAME.test(e.pinyin));
  const byPinyin = new Map<string, ReadingCandidate>();
  for (const e of common.length > 0 ? common : pool) {
    const key = e.pinyin.replace(/\s+/g, "").toLowerCase();
    const cur = byPinyin.get(key);
    byPinyin.set(key, { pinyin: e.pinyin, meanings: [...(cur?.meanings ?? []), ...e.meanings].slice(0, MAX_MEANINGS_SHOWN) });
  }
  return [...byPinyin.values()].slice(0, MAX_CANDIDATES);
}

export const HSK_GLOSS_SYSTEM =
  "Bạn là giáo viên tiếng Trung dạy người Việt. Với mỗi từ HSK bạn được cho vài cách đọc ứng viên từ từ điển. Hãy chọn cách đọc THÔNG DỤNG NHẤT trong tiếng Trung hiện đại (cách người học HSK gặp nhiều nhất, không phải họ người, âm cổ hay âm chỉ dùng trong từ ghép), rồi viết nghĩa tiếng Việt NGẮN, tự nhiên cho cách đọc đó. Chỉ trả về MỘT đối tượng JSON hợp lệ, không thêm chữ nào khác.";

export function buildHskGlossPrompt(items: HskGlossInput[]): string {
  const lines = items.map((i) => `${i.term}\n${i.candidates.map((c, n) => `  ${n + 1}. ${c.pinyin} | ${c.meanings.join("; ")}`).join("\n")}`).join("\n");
  return `Danh sách từ, mỗi từ có các cách đọc ứng viên được đánh số (số. pinyin | nghĩa tiếng Anh từ CC-CEDICT):
${lines}

Trả về JSON: {"items": {"<từ>": {"reading": <số thứ tự cách đọc thông dụng nhất>, "gloss": "<nghĩa tiếng Việt>"}, ...}} với ĐÚNG các từ ở trên.
Quy tắc cho "gloss":
- Tối đa 6 từ tiếng Việt, ưu tiên nghĩa THÔNG DỤNG NHẤT của cách đọc đã chọn, bỏ nghĩa cổ/hiếm/nghĩa họ người.
- Từ ngữ pháp (trợ từ, giới từ, lượng từ) ghi loại từ trong ngoặc rồi nghĩa/cách dùng ngắn, ví dụ "(trợ từ) đã, rồi", "(lượng từ) cái".
- Từ nhiều nghĩa: tối đa hai nghĩa phổ biến, ngăn bằng dấu phẩy.
- Không dịch máy móc từng chữ; không thêm pinyin hay chữ Hán vào nghĩa.`;
}

const schema = z.object({ items: z.record(z.string(), z.object({ reading: z.coerce.number().int(), gloss: z.string() })) });
export interface HskGloss { reading: string; gloss: string }

/** Đọc JSON model trả về: chỉ nhận mục có số thứ tự cách đọc nằm trong danh sách ứng viên và nghĩa không rỗng, không quá 80 ký tự. `missing` là các từ chưa dùng được. */
export function parseHskGlosses(raw: string, inputs: HskGlossInput[]): { glosses: Record<string, HskGloss>; missing: string[] } {
  let json: unknown;
  try { json = JSON.parse(raw.replace(/^```(?:json)?\s*|\s*```$/g, "")); } catch { return { glosses: {}, missing: inputs.map((i) => i.term) }; }
  const parsed = schema.safeParse(json);
  if (!parsed.success) return { glosses: {}, missing: inputs.map((i) => i.term) };
  const glosses: Record<string, HskGloss> = {};
  for (const input of inputs) {
    const item = parsed.data.items[input.term];
    const gloss = item?.gloss.trim();
    const candidate = item ? input.candidates[item.reading - 1] : undefined;
    if (candidate && gloss && gloss.length <= 80) glosses[input.term] = { reading: candidate.pinyin, gloss };
  }
  return { glosses, missing: inputs.filter((i) => !(i.term in glosses)).map((i) => i.term) };
}
