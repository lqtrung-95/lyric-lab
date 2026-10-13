import type { DictWordRow } from "@/lib/dictionary/build-dictionary-rows";
import { pickPrimaryEntry } from "@/lib/dictionary/lookup-words";
import { sinoVietForWord } from "@/lib/dictionary/sino-viet";

/** Các cấp HSK 3.0 có trang từ vựng (cấp 7 là nhóm 7–9 với ~5.700 từ, quá dài để làm trang đọc nên chưa có). */
export const HSK_LEVELS = [1, 2, 3, 4, 5, 6] as const;
export type HskLevel = (typeof HSK_LEVELS)[number];
export const isHskLevel = (n: number): n is HskLevel => (HSK_LEVELS as readonly number[]).includes(n);

export interface HskRow {
  word: string;
  pinyin: string;
  /** Âm Hán Việt ghép từ bảng Unihan; null khi thiếu chữ trong bảng (không đoán). */
  sinoViet: string | null;
  /** Tối đa 3 nghĩa tiếng Anh đã lọc bỏ ghi chú kỹ thuật của CC-CEDICT. */
  meanings: string[];
}

const MAX_MEANINGS = 3;
// Ghi chú của CC-CEDICT không phải nghĩa: lượng từ ("CL:..."), biến thể, "see ...", cách đọc ở Đài Loan...
const NOT_A_MEANING = /^(CL:|old variant of|variant of|also written|see also|see |abbr\. for|Taiwan pr\.|erhua variant)/i;

const MAX_MEANING_CHARS = 80;
const clip = (m: string) => (m.length > MAX_MEANING_CHARS ? `${m.slice(0, MAX_MEANING_CHARS - 1).trimEnd()}…` : m);

/** Giữ các nghĩa thật (bỏ ghi chú), tối đa 3 nghĩa, mỗi nghĩa cắt ở 80 ký tự; nếu lọc xong rỗng thì giữ nghĩa gốc đầu tiên để dòng không trống. */
export function cleanMeanings(meanings: string[]): string[] {
  const real = meanings.filter((m) => !NOT_A_MEANING.test(m.trim()));
  return (real.length > 0 ? real : meanings.slice(0, 1)).slice(0, MAX_MEANINGS).map(clip);
}

/**
 * Dựng bảng từ vựng của một cấp từ các dòng từ điển cùng cấp: gom theo từ (từ nhiều âm hoặc có mục biến thể chỉ lấy một mục chính qua `pickPrimaryEntry`),
 * xếp theo độ thường gặp (số thứ tự nhỏ = thường gặp hơn; thiếu thì xuống cuối, rồi theo chữ).
 */
export function buildHskRows(rows: DictWordRow[], sinoViet: ReadonlyMap<string, string[]>): HskRow[] {
  const byWord = new Map<string, DictWordRow[]>();
  for (const r of rows) byWord.set(r.simplified, [...(byWord.get(r.simplified) ?? []), r]);
  const picked = [...byWord.values()].flatMap((group) => {
    const entry = pickPrimaryEntry(group);
    return entry ? [entry] : [];
  });
  picked.sort((a, b) => (a.frequency ?? Infinity) - (b.frequency ?? Infinity) || a.simplified.localeCompare(b.simplified, "zh"));
  return picked.map((e) => ({ word: e.simplified, pinyin: e.pinyin, sinoViet: sinoVietForWord(e.traditional, sinoViet), meanings: cleanMeanings(e.meanings) }));
}
