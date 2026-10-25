import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { popularityBonus } from "./rank-results";

export interface CompoundWord {
  simplified: string;
  traditional: string;
  pinyin: string;
  hskLevel: number | null;
  /** Nghĩa tiếng Anh đầu tiên của cách đọc chính (nghĩa tiếng Việt đã duyệt được gắn sau, ở server). */
  meaning: string;
  gloss: string | null;
}

// Chữ hoa đầu (\p{Lu}), KHÔNG dùng khoảng À–Ỹ: khoảng đó cũng chứa chữ thường có dấu ("ài", "é") nên coi nhầm mọi âm tiết bắt đầu bằng nguyên âm có dấu là họ người.
const SURNAME = /^\p{Lu}/u;

/**
 * Từ ghép chứa `term` (không tính chính nó): mỗi từ một dòng (cách đọc thông dụng nhất), phổ biến trước (HSK, tần suất), rồi từ ngắn trước;
 * tên riêng (pinyin viết hoa) xuống cuối vì hiếm khi là thứ người học đang tìm.
 */
export function rankCompounds(rows: DictWordRow[], term: string, limit: number): CompoundWord[] {
  const best = new Map<string, DictWordRow>();
  for (const r of rows) {
    if (r.simplified === term || !r.simplified.includes(term)) continue;
    const cur = best.get(r.simplified);
    if (!cur || popularityBonus(r.hsk_level, r.frequency) > popularityBonus(cur.hsk_level, cur.frequency) || (SURNAME.test(cur.pinyin) && !SURNAME.test(r.pinyin))) best.set(r.simplified, r);
  }
  const score = (r: DictWordRow) => popularityBonus(r.hsk_level, r.frequency) - (SURNAME.test(r.pinyin) ? 1000 : 0) - r.simplified.length * 3;
  return [...best.values()].sort((a, b) => score(b) - score(a)).slice(0, limit).map((r) => ({
    simplified: r.simplified, traditional: r.traditional, pinyin: r.pinyin, hskLevel: r.hsk_level, meaning: r.meanings[0] ?? "", gloss: null,
  }));
}
