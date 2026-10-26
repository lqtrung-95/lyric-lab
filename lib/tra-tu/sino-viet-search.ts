import { foldVietnamese } from "./fold-vietnamese";

/** Bảng âm Hán Việt trong bộ nhớ: tra theo chữ (chữ phồn thể, như Unihan) và tra ngược theo âm đã gập dấu. */
export interface SinoVietIndex {
  byHanzi: ReadonlyMap<string, string[]>;
  byReading: ReadonlyMap<string, string[]>;
}

export function buildSinoVietIndex(rows: { hanzi: string; readings: string[] }[]): SinoVietIndex {
  const byHanzi = new Map<string, string[]>();
  const byReading = new Map<string, string[]>();
  for (const { hanzi, readings } of rows) {
    byHanzi.set(hanzi, readings);
    for (const r of new Set(readings.map(foldVietnamese))) byReading.set(r, [...(byReading.get(r) ?? []), hanzi]);
  }
  return { byHanzi, byReading };
}

const MAX_SYLLABLES = 4;
const MAX_COMBOS = 300;

/** Tách truy vấn thành các âm tiết Hán Việt (đã gập dấu); null nếu quá dài hoặc có âm tiết không tồn tại trong bảng. */
export function sinoVietSyllables(index: SinoVietIndex, folded: string): string[] | null {
  const parts = folded.split(" ").filter(Boolean);
  if (parts.length === 0 || parts.length > MAX_SYLLABLES) return null;
  return parts.every((p) => index.byReading.has(p)) ? parts : null;
}

/** Các chữ phồn thể có thể ghép thành từ đọc theo đúng chuỗi âm tiết (chặn số tổ hợp để truy vấn DB gọn). */
export function sinoVietCandidates(index: SinoVietIndex, syllables: string[]): string[] {
  let combos = [""];
  for (const s of syllables) {
    const chars = index.byReading.get(s) ?? [];
    const next: string[] = [];
    for (const prefix of combos) for (const ch of chars) { next.push(prefix + ch); if (next.length >= MAX_COMBOS) break; }
    combos = next;
  }
  return combos;
}

/** Từ (phồn thể) có đọc ra đúng chuỗi âm tiết không: mỗi chữ chỉ cần MỘT trong các âm của nó khớp (Unihan ghi nhiều âm cho một chữ). */
export function readsAs(index: SinoVietIndex, traditional: string, syllables: string[]): boolean {
  const chars = [...traditional];
  if (chars.length !== syllables.length) return false;
  return chars.every((ch, i) => (index.byHanzi.get(ch) ?? []).some((r) => foldVietnamese(r) === syllables[i]));
}
