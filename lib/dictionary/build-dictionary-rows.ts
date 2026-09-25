import type { CedictEntry } from "./parse-cedict";
import type { HskWord } from "./parse-hsk-vocabulary";

export interface DictWordRow {
  simplified: string;
  traditional: string;
  pinyin: string;
  meanings: string[];
  hsk_level: number | null;
  frequency: number | null;
}

const pinyinKey = (p: string) => p.replace(/\s+/g, "").toLowerCase();
const rowKey = (r: Pick<DictWordRow, "simplified" | "traditional" | "pinyin">) => `${r.simplified}|${r.traditional}|${r.pinyin}`;

/**
 * Gộp CC-CEDICT (nghĩa, pinyin, nhiều cách đọc) với danh sách HSK 3.0 (cấp, tần suất).
 * Cấp HSK gắn vào mục CEDICT cùng chữ giản thể và cùng pinyin (chọn đúng cách đọc của từ nhiều âm);
 * không trùng pinyin thì gắn vào mục đầu tiên; không có trong CEDICT thì thêm mục riêng từ dữ liệu HSK.
 */
export function buildDictWordRows(cedict: CedictEntry[], hsk: HskWord[]): DictWordRow[] {
  const rows = new Map<string, DictWordRow>();
  const bySimplified = new Map<string, DictWordRow[]>();

  const push = (row: DictWordRow) => {
    const existing = rows.get(rowKey(row));
    if (existing) {
      existing.meanings = [...new Set([...existing.meanings, ...row.meanings])];
      return;
    }
    rows.set(rowKey(row), row);
    bySimplified.set(row.simplified, [...(bySimplified.get(row.simplified) ?? []), row]);
  };

  for (const e of cedict) {
    push({ simplified: e.simplified, traditional: e.traditional, pinyin: e.pinyin, meanings: e.meanings, hsk_level: null, frequency: null });
  }

  for (const w of hsk) {
    const candidates = bySimplified.get(w.simplified);
    if (!candidates) {
      push({ simplified: w.simplified, traditional: w.traditional, pinyin: w.pinyin, meanings: w.meanings, hsk_level: w.level, frequency: w.frequency });
      continue;
    }
    const target = candidates.find((c) => pinyinKey(c.pinyin) === pinyinKey(w.pinyin)) ?? candidates[0];
    target.hsk_level = target.hsk_level === null ? w.level : Math.min(target.hsk_level, w.level);
    target.frequency = w.frequency;
  }
  return [...rows.values()];
}
