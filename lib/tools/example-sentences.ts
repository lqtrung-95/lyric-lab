import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";
import type { ExampleSentence } from "@/lib/courses/course-types";

export const MAX_EXAMPLE_QUERY = 6;
export const EXAMPLES_PER_QUERY = 6;

/** Từ (chữ Hán giản hoặc phồn thể, tối đa 6 chữ) cần tìm câu ví dụ, đã chuẩn hóa về giản thể. Rỗng nếu không có chữ Hán. */
export function normalizeExampleQuery(input: string): string {
  const han = [...input].filter((ch) => /\p{Script=Han}/u.test(ch)).join("").slice(0, MAX_EXAMPLE_QUERY);
  return han ? toSimplifiedChinese(han) : "";
}

/** Câu ví dụ gửi cho trình duyệt: không kèm điểm chất lượng nội bộ; `watchPath` mở video đúng chỗ câu đó. */
export interface ExampleItem { text: string; pinyin: string; translation: string; watchPath: string }

export function toExampleItems(sentences: readonly ExampleSentence[], limit = EXAMPLES_PER_QUERY): ExampleItem[] {
  return sentences.slice(0, limit).map((s) => ({
    text: s.text, pinyin: s.pinyin, translation: s.translation, watchPath: `/video/${encodeURIComponent(s.videoId)}?t=${Math.max(0, Math.floor(s.start))}`,
  }));
}

/** Tách câu thành các đoạn để tô sáng từ đang tìm (mọi chỗ xuất hiện). */
export function splitByTerm(text: string, term: string): { text: string; hit: boolean }[] {
  if (!term) return [{ text, hit: false }];
  const out: { text: string; hit: boolean }[] = [];
  let at = 0;
  for (let i = text.indexOf(term); i >= 0; i = text.indexOf(term, at)) {
    if (i > at) out.push({ text: text.slice(at, i), hit: false });
    out.push({ text: term, hit: true });
    at = i + term.length;
  }
  if (at < text.length) out.push({ text: text.slice(at), hit: false });
  return out.length ? out : [{ text, hit: false }];
}
