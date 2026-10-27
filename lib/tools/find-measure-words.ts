import { formatMeanings, type Classifier } from "@/lib/tra-tu/format-meanings";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { toSimplifiedChinese } from "@/lib/text/to-simplified-chinese";

export interface MeasureWordResult { term: string; traditional: string; pinyin: string; meaning: string; classifiers: Classifier[] }

export const MAX_MEASURE_QUERY = 12;

/** Danh từ (chữ Hán giản hoặc phồn thể) cần tra: chuẩn hóa về giản thể. Rỗng nếu không có chữ Hán. */
export function normalizeMeasureQuery(query: string): string {
  const han = [...query].filter((ch) => /\p{Script=Han}/u.test(ch)).join("").slice(0, MAX_MEASURE_QUERY);
  return han ? toSimplifiedChinese(han) : "";
}

/** Lượng từ của danh từ theo CC-CEDICT (mục `CL:` trong nghĩa). Từ có nhiều cách đọc thì chọn mục chính; từ không có lượng từ ghi sẵn trả `classifiers` rỗng. */
export function measureWordsFor(term: string, rows: readonly DictWordRow[]): MeasureWordResult | null {
  const row = pickPrimaryEntry([...rows]);
  if (!row) return null;
  const f = formatMeanings(row.meanings);
  return { term, traditional: row.traditional, pinyin: row.pinyin, meaning: f.senses.slice(0, 2).join("; "), classifiers: f.classifiers };
}
