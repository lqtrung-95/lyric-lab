import type { HskRow } from "@/lib/tools/build-hsk-rows";

/** Một từ cho game "Đoán chữ Hán từ âm Hán Việt". `cognate` = âm Hán Việt cũng là từ tiếng Việt quen thuộc ("đại học", "bệnh viện"). */
export interface HanVietWord { han: string; pinyin: string; sinoViet: string; meaning: string; level: number; cognate: boolean }

const TWO_HAN = /^\p{Script=Han}{2}$/u;

/** Bỏ dấu và hạ chữ thường để so sánh âm Hán Việt với nghĩa tiếng Việt ("Đại học" → "dai hoc"). */
export const plain = (s: string): string => s.normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/gi, "d").toLowerCase().replace(/\s+/g, " ").trim();

/**
 * Từ hai chữ có âm Hán Việt đủ hai tiếng và nghĩa Việt, từ một cấp HSK. Từ có nghĩa Việt chứa chính âm Hán Việt của nó (vd. "học sinh")
 * được đánh dấu `cognate`: đó là các từ người Việt đoán được nhờ Hán Việt. Giữ thứ tự độ thường gặp của `rows`, tối đa `limit` từ.
 */
export function hanVietWordsFrom(rows: readonly HskRow[], level: number, limit = 160): HanVietWord[] {
  const out: HanVietWord[] = [];
  for (const r of rows) {
    if (out.length >= limit) break;
    if (!TWO_HAN.test(r.word) || !r.sinoViet || !r.meaningVi || r.sinoViet.trim().split(/\s+/).length !== 2) continue;
    out.push({ han: r.word, pinyin: r.pinyin, sinoViet: r.sinoViet.trim(), meaning: r.meaningVi, level, cognate: plain(r.meaningVi).includes(plain(r.sinoViet)) });
  }
  return out;
}
